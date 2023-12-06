export default defineEventHandler(async (event) => {
  await protectRoute(event);
  await workspaceMinOwnerPermission(event);

  const { workspaceid } = event.context.params as {
    workspaceid: string;
  };

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceid },
  });

  if (!workspace) {
    throw createError({
      message: "Workspace not found",
      statusCode: 404,
    });
  }

  // Check if workspace is personal

  if (workspace.personal) {
    throw createError({
      message: "Cannot delete personal workspace",
      statusCode: 400,
    });
  }

  // todo: if we need to block this process, we can do it here

  // Get all the collections in the workspace and set the workspace_id to null
  await prisma.collection.updateMany({
    data: { workspace_id: null },
    where: { workspace_id: workspaceid },
  });

  await prisma.workspace.delete({
    where: { id: workspaceid },
  });

  return {
    message: "Workspace deleted",
    statusCode: 200,
  };
});
