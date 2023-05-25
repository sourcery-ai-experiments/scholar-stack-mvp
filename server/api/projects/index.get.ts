import protectRoute from "../../utils/protectRoute";
import prisma from "../../utils/prisma";

// @ts-ignore
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const user = await serverSupabaseUser(event);

  const projects = await prisma.project.findMany({
    where: {
      authorId: user.id,
    },
  });

  // might need to do some mapping here to get the data in the right format
  // might also need to reorder the data to get the right order

  return projects;
});
