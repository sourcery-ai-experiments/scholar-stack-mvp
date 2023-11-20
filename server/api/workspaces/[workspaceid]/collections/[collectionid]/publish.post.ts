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

  // Get the latest version of the collection
  const latestCollectionVersion = await prisma.version.findFirst({
    orderBy: {
      created: "desc",
    },
    where: {
      collection_id: collectionid,
    },
  });

  // Check if the collection has been published before
  if (latestCollectionVersion?.published) {
    throw createError({
      message: "Collection already published",
      statusCode: 400,
    });
  }

  // validate to see if the collection is publishable
  // todo: create a function to validate the collection
  // todo: this will be needed at two places so a function will be better

  // Publish the collection

  // meat and potatoes

  return {
    statusCode: 201,
    success: true,
  };
});
