import { nanoid } from "nanoid";
import calver from "calver";

export default defineEventHandler(async (event) => {
  await protectRoute(event);
  await workspaceMinAdminPermission(event);

  const { collectionid, workspaceid } = event.context.params as {
    collectionid: string;
    workspaceid: string;
  };

  const collection = await prisma.collection.findUnique({
    where: {
      id: collectionid,
      workspace_id: workspaceid,
    },
  });

  if (!collection) {
    throw createError({
      message: "Collection not found",
      statusCode: 404,
    });
  }

  const validationResults = await validateCollectionDraftVersion(event);

  if (!validationResults.valid) {
    throw createError({
      message: "Collection is not valid",
      statusCode: 422,
    });
  }

  const draftVersion = await prisma.version.findFirst({
    include: {
      StagingResources: true,
    },
    where: {
      collection_id: collectionid,
      published: false,
    },
  });

  if (!draftVersion) {
    throw createError({
      message: "There is no draft version to publish",
      statusCode: 404,
    });
  }

  // get the last published version
  const lastPublishedVersion = await prisma.version.findFirst({
    orderBy: {
      published_on: "desc",
    },
    where: {
      collection_id: collectionid,
      published: true,
    },
  });

  // start the reverse mapping process

  // create a new version
  const newVersion = await prisma.version.create({
    data: {
      name: `v.${calver.inc(
        "yyyy.ww.minor",
        lastPublishedVersion?.name || "",
        "calendar.minor"
      )}`,
      changelog: draftVersion.changelog,
      collection_id: collectionid,
      identifier: nanoid(),
    },
  });

  const stagingResources = draftVersion.StagingResources;

  const resources = stagingResources.map((resource) => {
    return {
      ...resource,
      new_resource_id: "",
    };
  });

  for (const resource of resources) {
    let newResourceId = resource.id;

    if (resource.original_resource_id) {
      if (resource.action === "update") {
        await prisma.resource.update({
          data: {
            title: resource.title,
            back_link_id: resource.back_link_id,
            description: resource.description,
            icon: resource.icon,
            target: resource.target,
            type: resource.type,
            Version: {
              connect: {
                id: newVersion.id,
              },
            },
          },
          where: {
            id: resource.original_resource_id,
          },
        });
      }

      if (resource.action === "newVersion") {
        const newResource = await prisma.resource.create({
          data: {
            title: resource.title,
            back_link_id: resource.original_resource_id,
            description: resource.description,
            icon: resource.icon,
            target: resource.target,
            type: resource.type,
            Version: {
              connect: {
                id: newVersion.id,
              },
            },
          },
        });

        newResourceId = newResource.id;
        resource.new_resource_id = newResource.id;
      }

      if (resource.action === "clone") {
        await prisma.version.update({
          data: {
            Resources: {
              connect: {
                id: resource.original_resource_id,
              },
            },
          },
          where: {
            id: newVersion.id,
          },
        });
      }
    } else {
      // these are for new resources
      if (resource.action === "create") {
        const newResource = await prisma.resource.create({
          data: {
            title: resource.title,
            description: resource.description,
            icon: resource.icon,
            target: resource.target,
            type: resource.type,
            Version: {
              connect: {
                id: newVersion.id,
              },
            },
          },
        });

        newResourceId = newResource.id;
        resource.new_resource_id = newResource.id;
      }

      if (resource.action === "delete" || resource.action === "oldVersion") {
        // don't do anything
        console.log("delete");
      }
    }

    const stagingExternalRelations =
      await prisma.stagingExternalRelation.findMany({
        where: {
          source_id: resource.id,
        },
      });

    const externalRelations = stagingExternalRelations.filter(
      (externalRelation) =>
        externalRelation.action !== "delete" ||
        (externalRelation.action === "delete" && externalRelation.original_id)
    );

    for (const externalRelation of externalRelations) {
      if (
        externalRelation.action === "update" &&
        externalRelation.original_id
      ) {
        await prisma.externalRelation.update({
          data: {
            resource_type: externalRelation.resource_type,
            type: externalRelation.type,
          },
          where: {
            id: externalRelation.original_id,
          },
        });
      }

      if (externalRelation.action === "create") {
        await prisma.externalRelation.create({
          data: {
            resource_type: externalRelation.resource_type,
            source_id: resource.original_resource_id || newResourceId,
            target: externalRelation.target,
            target_type: externalRelation.target_type,
            type: externalRelation.type,
          },
        });
      }

      if (externalRelation.action === "delete") {
        if (externalRelation.original_id) {
          await prisma.externalRelation.delete({
            where: {
              id: externalRelation.original_id,
            },
          });
        } else {
          throw createError({
            message: "External relation not found",
            statusCode: 404,
          });
        }
      }
    }
  }

  for (const resource of resources) {
    const stagingInternalRelations =
      await prisma.stagingInternalRelation.findMany({
        where: {
          source_id: resource.id,
        },
      });

    const internalRelations = stagingInternalRelations.filter(
      (internalRelation) =>
        internalRelation.action !== "delete" ||
        (internalRelation.action === "delete" && internalRelation.original_id)
    );

    for (const internalRelation of internalRelations) {
      if (
        internalRelation.action === "update" &&
        internalRelation.original_id
      ) {
        await prisma.internalRelation.update({
          data: {
            resource_type: internalRelation.resource_type,
            type: internalRelation.type,
          },
          where: {
            id: internalRelation.original_id,
          },
        });
      }

      if (internalRelation.action === "create") {
        const targetResource = resources.find(
          (stagingResource) => stagingResource.id === internalRelation.target_id
        );

        await prisma.internalRelation.create({
          data: {
            resource_type: internalRelation.resource_type,
            source_id:
              resource.original_resource_id || resource.new_resource_id,
            target_id:
              targetResource?.new_resource_id || internalRelation.target_id,
            type: internalRelation.type,
          },
        });
      }

      if (internalRelation.action === "delete") {
        if (internalRelation.original_id) {
          await prisma.internalRelation.delete({
            where: {
              id: internalRelation.original_id,
            },
          });
        } else {
          throw createError({
            message: "Internal relation not found",
            statusCode: 404,
          });
        }
      }
    }
  }

  // publish the the version
  await prisma.version.update({
    data: {
      published: true,
      published_on: new Date(),
    },
    where: {
      id: newVersion.id,
    },
  });

  // clean up the staging items
  for (const resource of stagingResources) {
    await prisma.stagingExternalRelation.deleteMany({
      where: {
        source_id: resource.id,
      },
    });

    await prisma.stagingInternalRelation.deleteMany({
      where: {
        source_id: resource.id,
      },
    });

    await prisma.stagingInternalRelation.deleteMany({
      where: {
        target_id: resource.id,
      },
    });

    await prisma.stagingResource.delete({
      where: {
        id: resource.id,
      },
    });
  }

  await prisma.version.delete({
    where: {
      id: draftVersion.id,
    },
  });

  return {
    statusCode: 201,
    success: true,
  };
});
