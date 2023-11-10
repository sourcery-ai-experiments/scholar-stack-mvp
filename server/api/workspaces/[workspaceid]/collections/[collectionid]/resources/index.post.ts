export default defineEventHandler(async (event) => {
  await protectRoute(event);
  await workspaceMinEditorPermission(event);

  const { collectionid, workspaceid } = event.context.params as {
    collectionid: string;
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

  // get the latest version of the collection
  const version = await prisma.version.findMany({
    orderBy: { created: "desc" },
    take: 1,
    where: { collection_id: collectionid, published: false },
  });

  // if there is no version return an error
  if (version.length === 0) {
    throw createError({
      message: "No draft version found",
      statusCode: 404,
    });
  }

  // Add a new resource to the collection
  // Also add the resource to the version
  const resource = await prisma.stagingResource.create({
    data: {
      target: "",
      type: "",
    },
  });

  const addedToVersion = await prisma.version.update({
    data: {
      StagingResources: {
        connect: { id: resource.id },
      },
    },
    where: { id: version[0].id },
  });

  console.log(addedToVersion);

  return {
    resourceId: resource.id,
    statusCode: 201,
  };
});
