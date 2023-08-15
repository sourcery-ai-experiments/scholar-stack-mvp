import prisma from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const { videntifier } = event.context.params as { videntifier: string };

  if (!videntifier) {
    throw createError({ message: "Missing identifier", statusCode: 400 });
  }

  // check if identifier starts with a v
  if (!videntifier.startsWith("v")) {
    throw createError({ message: "Invalid identifier", statusCode: 400 });
  }

  const releaseNotes = await prisma.version.findUnique({
    select: { changes: true },
    where: { identifier: videntifier },
  });

  console.log(releaseNotes);

  if (!releaseNotes) {
    throw createError({ message: "Invalid identifier", statusCode: 400 });
  }

  return releaseNotes;
});
