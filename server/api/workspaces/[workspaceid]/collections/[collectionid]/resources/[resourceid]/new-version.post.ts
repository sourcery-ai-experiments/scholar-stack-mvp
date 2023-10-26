import { z } from "zod";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const bodySchema = z
    .object({
      back_link_id: z.string().min(1),
    })
    .strict();

  const body = await readBody(event);

  // Check if the body is present
  if (!body) {
    throw createError({
      message: "Missing required fields",
      statusCode: 400,
    });
  }

  // Check if the body is valid
  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    console.log(parsedBody.error);

    throw createError({
      message: "The provided parameters are invalid",
      statusCode: 400,
    });
  }

  await workspaceMinEditorPermission(event);

  const { collectionid, resourceid, workspaceid } = event.context.params as {
    collectionid: string;
    resourceid: string;
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
    where: { collection_id: collectionid, published: false },
  });

  // if there is no version return an error
  if (version.length === 0) {
    throw createError({
      message: "No draft version found",
      statusCode: 404,
    });
  }

  // get the resource
  const resource = await prisma.resource.findUnique({
    where: { id: resourceid },
  });

  // if there is no resource return an error
  if (!resource) {
    throw createError({
      message: "Resource not found",
      statusCode: 404,
    });
  }

  // Add a new resource to the collection
  // Also add the resource to the version
  const newResourceVersion = await prisma.resource.create({
    data: {
      title: resource.title,
      back_link_id: parsedBody.data.back_link_id,
      description: resource.description,
      icon: resource.icon,
      target: resource.target,
      type: resource.type,
    },
  });

  await prisma.version.update({
    data: {
      Resources: {
        connect: { id: newResourceVersion.id },
      },
    },
    where: { id: version[0].id },
  });

  return {
    resourceId: newResourceVersion.id,
    statusCode: 201,
  };
});
