// import protectRoute from "../../utils/protectRoute";
import prisma from "../../utils/prisma";

// @ts-ignore

export default defineEventHandler(async (event) => {
  // await protectRoute(event); // most likely not needed

  const { id } = event.context.params as { id: string };

  const project = await prisma.project.findUnique({
    where: { identifier: id },
  });

  if (!project) {
    throw createError({
      message: "Project not found",
      statusCode: 404,
    });
  }

  const latestVersion = await prisma.version.findFirst({
    orderBy: { created: "desc" },
    where: { projectId: project.id },
  });

  if (!latestVersion) {
    return {
      ...project,
      allVersions: [],
      latestVersion: {
        links: [],
      },
    };
  }

  // get links from the latest version
  const links = await prisma.link.findMany({
    orderBy: { name: "asc" },
    where: { versionId: latestVersion.id },
  });

  const listOfVersions = await prisma.version.findMany({
    orderBy: { created: "desc" },
    select: {
      name: true,
      created: true,
      identifier: true,
    },
    where: { projectId: project.id },
  });

  const response = {
    ...project,
    allVersions: listOfVersions,
    latestVersion: {
      ...latestVersion,
      links,
    },
  };

  return response;
});
