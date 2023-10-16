/**
 * Delete a collection
 * TODO: DELETE THIS ENDPOINT
 */

export default defineEventHandler(async (event) => {
  await protectRoute(event);
  await workspaceMinOwnerPermission(event);

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

  const deletedCollection = await prisma.collection.delete({
    where: { id: collectionid },
  });

  if (!deletedCollection) {
    throw createError({
      message: "Collection not found",
      statusCode: 404,
    });
  }

  return {
    message: "Collection deleted",
    statusCode: 200,
  };
});
