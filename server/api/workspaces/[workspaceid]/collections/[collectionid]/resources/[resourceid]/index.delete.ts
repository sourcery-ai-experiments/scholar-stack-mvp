export default defineEventHandler(async (event) => {
  await protectRoute(event);
  await workspaceMinEditorPermission(event);

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

  // Check if the resource exists
  const resource = await prisma.stagingResource.findUnique({
    where: { id: resourceid },
  });

  if (!resource) {
    throw createError({
      message: "Resource not found",
      statusCode: 404,
    });
  }

  // Check if the resource is part of any published versions
  if (resource.orignal_resource_id) {
    const publishedResource = await prisma.resource.findFirst({
      where: {
        id: resource.orignal_resource_id,
        Version: {
          some: {
            published: true,
          },
        },
      },
    });

    if (publishedResource) {
      // If the resource is part of a published version, we can't delete it
      // We should mark the resource as deleted from the draft version instead

      const draftVersion = await prisma.version.findFirst({
        where: {
          collection_id: collectionid,
          published: false,
        },
      });

      if (!draftVersion) {
        throw createError({
          message: "Draft version not found",
          statusCode: 404,
        });
      }

      // mark the resource as deleted
      await prisma.stagingResource.update({
        data: {
          action: "delete",
        },
        where: { id: resourceid },
      });
    } else {
      // Delete the resource
      await prisma.stagingResource.delete({
        where: { id: resourceid },
      });
    }
  } else {
    // todo: this shouldn't be possible i think. Anything with an original_resource_id should be part of a published version
    // will need to check this later
    // Delete the resource
    await prisma.stagingResource.delete({
      where: { id: resourceid },
    });
  }

  // todo: remove relations upon deletion
  // Added cascade delete to the database. This should be handled by the database instead.
  // check if this works though

  return {
    message: "Resource removed",
    statusCode: 200,
  };
});
