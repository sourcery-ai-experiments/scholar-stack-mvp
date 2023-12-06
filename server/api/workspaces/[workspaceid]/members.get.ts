export default defineEventHandler(async (event) => {
  await protectRoute(event);
  await workspaceMinViewerPermission(event);

  const { workspaceid } = event.context.params as { workspaceid: string };

  const members = await prisma.access.findMany({
    include: { user: true },
    where: { workspace_id: workspaceid },
  });

  const invitedMembers = await prisma.invite.findMany({
    where: { workspace_id: workspaceid },
  });

  return {
    invitedMembers: invitedMembers.map((member) => ({
      id: member.email_address,
      created: member.created.toISOString(),
      role: member.role,
    })),
    members: members.map((member) => ({
      id: member.user_id,
      name: member.user.name,
      created: member.created.toISOString(),
      emailAddress: member.user.email_address,
      role: member.role,
    })),
  };
});
