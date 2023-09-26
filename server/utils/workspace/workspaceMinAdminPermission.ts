import prisma from "~/server/utils/prisma";
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const userid = user?.id as string;

  // Check if the workspace exists
  const workspaceid = await workspaceExists(event);

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

  // Check if the user has at least admin permisison
  if (access.role !== "admin" && access.role !== "owner") {
    throw createError({
      message: "Unauthorized",
      statusCode: 401,
    });
  }
});
