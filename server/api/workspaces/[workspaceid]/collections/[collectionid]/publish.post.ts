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
    if (resource.orignal_resource_id) {
      await prisma.resource.update({
        data: {
          title: resource.title,
          back_link_id: resource.back_link_id, // todo: this is not being updated
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
  }

  return {
    statusCode: 201,
    success: true,
  };
});
