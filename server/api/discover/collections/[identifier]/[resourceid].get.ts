export default defineEventHandler(async (event) => {
  const { identifier, resourceid } = event.context.params as {
    identifier: string;
    resourceid: string;
  };

  const regex = /^[cv][a-zA-Z0-9-_]{8,9}$/;

  if (!regex.test(identifier)) {
    throw createError({
      message: "Invalid identifier",
      statusCode: 400,
    });
  }

  // Get the first character of the identifier
  const type = identifier[0];

  let collectionId = "";

  // if the first character is "c" then it's a collection. We need to get the collection id
  if (type === "c") {
    const collection = await prisma.collection.findUnique({
      where: { identifier },
    });

    if (!collection) {
      throw createError({
        message: "Collection not found",
        statusCode: 404,
      });
    }

    collectionId = collection.id;
  } else {
    const version = await prisma.version.findFirst({
      include: { collection: true },
      where: { identifier },
    });

    if (!version) {
      throw createError({
        message: "Version not found",
        statusCode: 404,
      });
    }

    collectionId = version.collection.id;
  }

  const resource = await prisma.resource.findFirst({
    where: {
      id: resourceid,
      Version: { some: { collection_id: collectionId } },
    },
  });

  if (!resource) {
    throw createError({
      message: "Resource not found",
      statusCode: 404,
    });
  }

  return resource;
});
