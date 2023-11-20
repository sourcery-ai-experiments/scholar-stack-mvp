import { z } from "zod";

export default defineEventHandler(async (event) => {
  await protectRoute(event);
  await workspaceMinViewerPermission(event);

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
  const versions = await prisma.version.findMany({
    include: {
      StagingResources: true,
    },
    orderBy: { created: "desc" },
    take: 1,
    where: { collection_id: collectionid },
  });

  if (versions.length === 0 || versions[0].published) {
    throw createError({
      message: "There are no unpublished versions of this collection",
      statusCode: 404,
    });
  }

  const version = versions[0];

  const resources = version.StagingResources;

  const resourceSchema = z.object({
    title: z.string().min(1),
    description: z.string(),
    icon: z.string().min(1),
    target: z.string().min(1),
    type: z.string().min(1),
  });

  const resourcesWithErrors = [];

  for (const resource of resources) {
    // validate the resource
    const parsedResource = resourceSchema.safeParse(resource);

    if (!parsedResource.success) {
      resourcesWithErrors.push({
        ...parsedResource.error,
        id: resource.id,
        title: resource.title,
      });
    }

    // todo: might also need to validate the relations
    // Although this might be handled at relation post so mighht not be needed
  }

  if (resourcesWithErrors.length > 0) {
    return {
      errors: resourcesWithErrors,
      statusCode: 200,
      valid: false,
    };
  }

  return {
    errors: [],
    statusCode: 200,
    valid: true,
  };
});
