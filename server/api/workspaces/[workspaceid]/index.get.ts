export default defineEventHandler(async (event) => {
  await protectRoute(event);
  await workspaceMinViewerPermission(event);

  const { workspaceid } = event.context.params as { workspaceid: string };

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceid },
  });

  if (!workspace) {
    throw createError({
      message: "Workspace not found",
      statusCode: 404,
    });
  }

  const collections = await prisma.collection.findMany({
    include: {
      Versions: {
        orderBy: { created: "desc" },
        take: 1,
      },
    },
    where: { workspace_id: workspaceid },
  });

  const responseWorkspace: APIResponseWorkspace = {
    id: workspace.id,
    title: workspace.title,
    collections: collections.map((collection) => ({
      id: collection.id,
      title: collection.title,
      created: collection.created.toISOString(),
      description: collection.description,
      identifier: collection.identifier,
      image: collection.image,
      updated: collection.updated.toISOString(),
      version: {
        ...collection.Versions[0],
        created: collection.Versions[0].created.toISOString(),
        published_on: collection.Versions[0].published_on
          ? collection.Versions[0].published_on.toISOString()
          : "",
        updated: collection.Versions[0].updated.toISOString(),
      },
    })),
    description: workspace.description,
    personal: workspace.personal,
  };

  return responseWorkspace;
});
