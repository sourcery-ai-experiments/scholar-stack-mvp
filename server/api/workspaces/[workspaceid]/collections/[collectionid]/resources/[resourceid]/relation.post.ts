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

  const newRelation = await prisma.relation.create({
    data: {
      source: resourceid,
      target: "",
      target_type: "",
      type: "",
    },
  });

  return {
    id: newRelation.id,
    message: "Relation created",
    statusCode: 201,
  };
});
