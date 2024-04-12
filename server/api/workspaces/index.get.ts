import { nanoid } from "nanoid";
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const user = await serverSupabaseUser(event);
  const userid = user?.id as string;

  const workspaces = await prisma.workspaceMember.findMany({
    select: {
      workspace: {
        select: {
          id: true,
          title: true,
          created: true,
          description: true,
          personal: true,
          type: true,
        },
      },
    },
    where: {
      user_id: user?.id,
    },
  });

  const workspaceId = nanoid();

  /**
   * todo: potential race condition here. If two requests come in at the same time, they could both create a personal workspace.
   * to fix this we could use a transaction to check if the user has a personal workspace before creating one.
   * or native sql https://stackoverflow.com/questions/11467925/execute-insert-statement-only-if-a-certain-condition-is-met
   */

  // Create a personal workspace if the user doesn't have any
  if (!workspaces || workspaces.length === 0) {
    const personalWorkspace = await prisma.workspace.create({
      data: {
        id: workspaceId,
        title: "My workspace",
        description: "This is my personal workspace",
        personal: true,
        type: "personal",
        WorkspaceMember: {
          create: {
            admin: false,
            owner: true,
            user_id: userid,
          },
        },
      },
    });

    return [personalWorkspace];
  }

  return workspaces.map((workspace) => workspace.workspace);
});
