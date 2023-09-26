import prisma from "~/server/utils/prisma";
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const userid = user?.id as string;

  const { workspaceid } = event.context.params as { workspaceid: string };

  // Check if the workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceid,
    },
  });

  if (!workspace) {
    throw createError({
      message: "Workspace not found",
      statusCode: 404,
    });
  }

  // Check access table for the workspace
  const access = await prisma.access.findFirst({
    where: {
      user_id: userid,
      workspace_id: workspaceid,
    },
  });

  if (!access) {
    throw createError({
      message: "Unauthorized",
      statusCode: 401,
    });
  }

  // Check if the user is an owner of the workspace
  if (
    access.role !== "owner" &&
    access.role !== "admin" &&
    access.role !== "editor"
  ) {
    throw createError({
      message: "Unauthorized",
      statusCode: 401,
    });
  }

  return true;
});
