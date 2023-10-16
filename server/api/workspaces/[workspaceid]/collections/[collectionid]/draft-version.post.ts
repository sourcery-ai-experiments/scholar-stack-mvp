import { nanoid } from "nanoid";

export default defineEventHandler(async (event) => {
  await protectRoute(event);
  await workspaceMinAdminPermission(event);

  const { collectionid, workspaceid } = event.context.params as {
    collectionid: string;
    workspaceid: string;
  };

  const collection = await prisma.collection.findUnique({
    where: { id: collectionid, workspace_id: workspaceid },
  });

  if (!collection) {
    throw createError({
      message: "Collection not found",
      statusCode: 404,
    });
  }

  // get the latest version of the collection
  const version = await prisma.version.findMany({
    orderBy: { created: "desc" },
    take: 1,
    where: { collection_id: collectionid },
  });

  console.log(version);

  // if there is no version or the latest version is published, create a new version
  if (version.length === 0 || version[0].published) {
    const draftVersion = await prisma.version.create({
      data: {
        name: "Draft",
        changelog: "xxx",
        collection_id: collectionid,
        identifier: nanoid(),
      },
    });

    console.log(draftVersion);

    return {
      statusCode: 201,
      version: draftVersion,
    };
  }

  // if there is a draft version, return it
  return {
    statusCode: 200,
    version: version[0],
  };
});
