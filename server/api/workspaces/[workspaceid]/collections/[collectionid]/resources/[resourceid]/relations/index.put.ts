import { z } from "zod";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const bodySchema = z
    .object({
      external: z.array(
        z.object({
          id: z.string().optional(),
          resource_type: z.string(),
          target: z.string(),
          target_type: z.string(),
          type: z.string(),
        })
      ),
      internal: z.array(
        z.object({
          id: z.string().optional(),
          resource_type: z.string(),
          target_id: z.string(),
          type: z.string(),
        })
      ),
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

  const { external, internal } = parsedBody.data;

  // Check if the relation exists for the ones with an id and that the relation is part of the resource
  for (const relation of external) {
    if (relation.id) {
      const existingRelation = await prisma.externalRelation.findUnique({
        where: { id: relation.id, source_id: resourceid },
      });

      if (!existingRelation) {
        throw createError({
          message: "Relation not found",
          statusCode: 404,
        });
      }
    }
  }

  // Check if the relation exists for the ones with an id and that the relation is part of the resource
  for (const relation of internal) {
    if (relation.id) {
      const existingRelation = await prisma.internalRelation.findUnique({
        where: { id: relation.id, source_id: resourceid },
      });

      if (!existingRelation) {
        throw createError({
          message: "Relation not found",
          statusCode: 404,
        });
      }
    }
  }

  // Update the relations
  for (const relation of external) {
    if (relation.id) {
      await prisma.externalRelation.update({
        data: {
          resource_type: relation.resource_type,
          target: relation.target,
          target_type: relation.target_type,
          type: relation.type,
        },
        where: {
          id: relation.id,
        },
      });
    } else {
      await prisma.externalRelation.create({
        data: {
          resource_type: relation.resource_type,
          source_id: resourceid,
          target: relation.target,
          target_type: relation.target_type,
          type: relation.type,
        },
      });
    }
  }

  // Update the relations
  for (const relation of internal) {
    if (relation.id) {
      await prisma.internalRelation.update({
        data: {
          resource_type: relation.resource_type,
          target_id: relation.target_id,
          type: relation.type,
        },
        where: {
          id: relation.id,
        },
      });
    } else {
      await prisma.internalRelation.create({
        data: {
          resource_type: relation.resource_type,
          source_id: resourceid,
          target_id: relation.target_id,
          type: relation.type,
        },
      });
    }
  }

  // TODO: Add the mirror relations

  // Organize the relations to return

  // get all the relations for the resource
  const internalRelations = await prisma.internalRelation.findMany({
    orderBy: {
      created: "asc",
    },
    where: {
      source_id: resourceid,
    },
  });

  const externalRelations = await prisma.externalRelation.findMany({
    orderBy: {
      created: "asc",
    },
    where: {
      source_id: resourceid,
    },
  });

  return {
    message: "Relations updated",
    relations: {
      external: externalRelations,
      internal: internalRelations,
    },
    statusCode: 200,
  };
});
