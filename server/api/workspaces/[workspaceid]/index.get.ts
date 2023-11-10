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
    })),
    description: workspace.description,
    personal: workspace.personal,
  };

  return responseWorkspace;
});
