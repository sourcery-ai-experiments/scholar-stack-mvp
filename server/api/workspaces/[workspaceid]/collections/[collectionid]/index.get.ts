export default defineEventHandler(async (event) => {
  await protectRoute(event);
  await workspaceMinViewerPermission(event);

  const { collectionid } = event.context.params as {
    collectionid: string;
    workspaceid: string;
  };

  /**
   * TODO: split this into three queries
   */
  const collection = await prisma.collection.findUnique({
    include: {
      Versions: {
        include: {
          Resources: true,
        },
      },
    },
    where: { id: collectionid },
  });

  if (!collection) {
    throw createError({
      message: "Collection not found",
      statusCode: 404,
    });
  }

  // keep only the latest version
  collection.Versions = collection.Versions.sort(
    (a, b) => b.created.getTime() - a.created.getTime()
  ).slice(0, 1);

  return collection;
});
