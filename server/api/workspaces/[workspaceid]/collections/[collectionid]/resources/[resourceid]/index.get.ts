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
  const resource = await prisma.resource.findUnique({
    // include: {
    //   Relation: true,
    // },
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

  // get all the relations for the resource
  // const relations = await prisma.relation.findMany({
  //   where: {
  //     resource_id: resourceid,
  //   },
  // });

  return {
    ...resource,
    type: resource.type || null,
  };
});
