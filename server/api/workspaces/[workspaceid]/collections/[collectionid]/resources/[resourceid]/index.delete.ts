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
  const resource = await prisma.resource.findUnique({
    where: { id: resourceid },
  });

  if (!resource) {
    throw createError({
      message: "Resource not found",
      statusCode: 404,
    });
  }

  // Check if the resource is part of any published versions
  const publishedResource = await prisma.resource.findFirst({
    where: {
      id: resourceid,
      Version: {
        some: {
          published: true,
        },
      },
    },
  });

  if (publishedResource) {
    // If the resource is part of a published version, we can't delete it
    // We should remove it from the draft version instead

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

    // Remove the resource from the draft version
    await prisma.version.update({
      data: {
        Resources: {
          disconnect: {
            id: resourceid,
          },
        },
      },
      where: { id: draftVersion.id },
    });
  } else {
    // Delete the resource
    await prisma.resource.delete({
      where: { id: resourceid },
    });
  }

  return {
    message: "Resource removed",
    statusCode: 200,
  };
});
