import protectRoute from "../../utils/protectRoute";
import prisma from "../../utils/prisma";

// @ts-ignore

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const { id } = event.context.params as { id: string };

  const project = await prisma.project.findUnique({
    include: {
      subprojects: true,
    },
    where: {
      id,
    },
  });
});
