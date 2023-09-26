import protectRoute from "~/server/utils/protectRoute";
import prisma from "~/server/utils/prisma";

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
      author_id: user?.id,
    },
  });

  for (const project of projects) {
    const versions = await prisma.version.findMany({
      where: {
        project_id: project.id,
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
