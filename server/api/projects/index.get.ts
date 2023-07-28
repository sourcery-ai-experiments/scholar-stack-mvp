import protectRoute from "../../utils/protectRoute";
import prisma from "../../utils/prisma";

// @ts-ignore
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const user = await serverSupabaseUser(event);

  const projects = await prisma.project.findMany({
    include: {
      versions: {
        orderBy: {
          created: "desc",
        },
        select: {
          latest: true,
          updated: true,
        },
      },
    },
    where: {
      authorId: user?.id,
    },
  });

  for (const project of projects) {
    const versions = await prisma.version.findMany({
      where: {
        projectId: project.id,
      },
    });

    for (const version of versions) {
      if (version.latest) {
        project.updated = version.updated;

        break;
      }
    }
  }

  // might need to do some mapping here to get the data in the right format
  // might also need to reorder the data to get the right order

  return projects;
});
