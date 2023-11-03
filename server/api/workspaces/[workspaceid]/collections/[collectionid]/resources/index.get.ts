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

  // get all the versions for the collection
  const versions = await prisma.version.findMany({
    where: {
      collection_id: collectionid,
    },
  });

  const response: ResourcesList = [];

  // get the resources for each version
  for (const version of versions) {
    const group = {
      children: [] as ResourcesListItemChildren,
      key: version.id,
      label: version.name,
      type: "group",
    };

    const resources = await prisma.resource.findMany({
      where: {
        Version: {
          some: {
            id: version.id,
          },
        },
      },
    });

    for (const resource of resources) {
      group.children.push({
        label: resource.title,
        value: resource.id,
      });
    }

    response.push(group);
  }

  return response;
});
