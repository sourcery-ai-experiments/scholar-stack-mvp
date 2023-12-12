export default defineEventHandler(async (event) => {
  await protectRoute(event);
  await workspaceMinViewerPermission(event);

  const { collectionid, resourceid, workspaceid } = event.context.params as {
    collectionid: string;
    resourceid: string;
    workspaceid: string;
  };

  const collection = await prisma.collection.findUnique({
    where: { id: collectionid, workspace_id: workspaceid },
  });

  if (!collection) {
    throw createError({
      message: "Collection not found",
      statusCode: 404,
    });
  }

  // Check if the resource is part of the collection version
  const resource = await prisma.stagingResource.findUnique({
    where: {
      id: resourceid,
      Version: {
        some: {
          collection_id: collectionid,
        },
      },
    },
  });

  if (!resource) {
    throw createError({
      message: "Resource not found",
      statusCode: 404,
    });
  }

  return {
    ...resource,
    type: resource.type || null,
  };
});
