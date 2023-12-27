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

  const allResources = [];
  const allResourceIds = [];

  // get the resources for each version
  for (const version of versions) {
    const resources = await prisma.stagingResource.findMany({
      where: {
        Version: {
          some: {
            id: version.id,
          },
        },
      },
    });

    for (const resource of resources) {
      allResources.push(resource);
      allResourceIds.push(resource.id);
    }
  }

  // Get a unique list of all the resources
  const uniqueResourceIds = [...new Set(allResourceIds)];

  // Remove the resources that are not in the collection
  const resources = allResources.filter((resource) =>
    uniqueResourceIds.includes(resource.id)
  );

  for (const resource of resources) {
    const item = {
      label: resource.title,
      value: resource.id,
      versionLabel: resource.version_label,
    };

    response.push(item);
  }

  return response;
});
