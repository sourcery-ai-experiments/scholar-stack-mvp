import { nanoid } from "nanoid";

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

  // start the reverse mapping process

  // create a new version
  const newVersion = await prisma.version.create({
    data: {
      name: draftVersion.name,
      changelog: draftVersion.changelog,
      collection_id: collectionid,
      identifier: nanoid(),
    },
  });

  const stagingResources = draftVersion.StagingResources;

  for (const resource of stagingResources) {
    let newResourceId = resource.id;

    if (resource.orignal_resource_id) {
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
            id: resource.orignal_resource_id,
          },
        });
      }

      if (resource.action === "newVersion") {
        const newResource = await prisma.resource.create({
          data: {
            title: resource.title,
            back_link_id: resource.orignal_resource_id,
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
      }

      if (resource.action === "clone") {
        await prisma.version.update({
          data: {
            Resources: {
              connect: {
                id: resource.orignal_resource_id,
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
      if (externalRelation.action === "update") {
        await prisma.externalRelation.update({
          data: {
            resource_type: externalRelation.resource_type,
            target: externalRelation.target,
            target_type: externalRelation.target_type,
            type: externalRelation.type,
          },
          where: {
            id: resource.orignal_resource_id || newResourceId,
          },
        });
      }

      if (externalRelation.action === "create") {
        await prisma.externalRelation.create({
          data: {
            resource_type: externalRelation.resource_type,
            source_id: resource.orignal_resource_id || newResourceId,
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
