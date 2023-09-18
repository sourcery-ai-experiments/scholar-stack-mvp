import prisma from "../../utils/prisma";
import protectRoute from "../../utils/protectRoute";

import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const user = await serverSupabaseUser(event);

  const workspaces = await prisma.access.findMany({
    select: {
      workspace: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
    },
    where: {
      user_id: user?.id,
    },
  });

  return workspaces.map((workspace) => workspace.workspace);
});
