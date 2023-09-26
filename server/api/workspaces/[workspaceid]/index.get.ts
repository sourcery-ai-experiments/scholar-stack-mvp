import protectRoute from "~/server/utils/protectRoute";
import prisma from "~/server/utils/prisma";

// import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  /**
   * TODO Add middleware file to see if user is a member of the workspace
   */
  // const user = await serverSupabaseUser(event);

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
    where: { workspaceId: workspaceid },
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
  };

  return responseWorkspace;
});
