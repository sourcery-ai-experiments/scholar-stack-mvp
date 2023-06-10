// import protectRoute from "../../utils/protectRoute";
import prisma from "../../utils/prisma";

// @ts-ignore
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  const { id } = event.context.params as { id: string };

  const project = await prisma.project.findUnique({
    include: {
      versions: {
        orderBy: { created: "desc" },
        select: {
          name: true,
          created: true,
          identifier: true,
        },
      },
    },
    where: { identifier: id },
  });

  if (!project) {
    throw createError({
      message: "Project not found",
      statusCode: 404,
    });
  }

  const responseProject: ResponseProject = {
    ...project,
    isAuthor: false,
    latestVersion: {},
  };

  if (user?.id === responseProject.authorId) {
    responseProject.isAuthor = true;
  }
  delete responseProject.authorId;

  const latestVersion = await prisma.version.findFirst({
    include: {
      links: true,
    },
    orderBy: { created: "desc" },
    where: { projectId: project.id },
  });

  const response = {
    ...responseProject,
    latestVersion: latestVersion || {},
  };

  return response;
});
