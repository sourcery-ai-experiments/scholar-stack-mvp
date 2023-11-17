/**
 * Clone the latest version of a collection into a draft version
 */
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
  const latestVersion = await prisma.version.findFirst({
    orderBy: { created: "desc" },
    where: { collection_id: collectionid },
  });

  if (!latestVersion) {
    const draftVersion = await prisma.version.create({
      data: {
        name: "Draft",
        changelog: "xxx",
        collection_id: collectionid,
        identifier: nanoid(),
      },
    });

    return {
      statusCode: 201,
      version: draftVersion,
    };
  }

  // if the latest version is published clone it into a draft version
  if (latestVersion.published) {
    const draftVersion = await prisma.version.create({
      data: {
        name: "Draft",
        changelog: "xxx",
        collection_id: collectionid,
        identifier: nanoid(),
      },
    });

    // Get all the resources in the latest version

    const originalResources = await prisma.resource.findMany({
      where: {
        Version: {
          some: {
            id: latestVersion.id,
          },
        },
      },
    });

    // clone each resource into the staging table
    for (const originalResource of originalResources) {
      // clone the resource itself
      const newStagingResource = await prisma.stagingResource.create({
        data: {
          title: originalResource.title,
          action: "cloned",
          back_link_id: originalResource.back_link_id, // todo: check if this is correct
          description: originalResource.description,
          icon: originalResource.icon,
          orignal_resource_id: originalResource.id,
          target: originalResource.target,
          type: originalResource.type,
        },
      });

      // clone the relations to the resource

      // clone the external relations
      const originalExternalRelations = await prisma.externalRelation.findMany({
        where: {
          source_id: originalResource.id,
        },
      });

      for (const originalExternalRelation of originalExternalRelations) {
        await prisma.stagingExternalRelation.create({
          data: {
            action: "cloned",
            original_source_id: originalResource.id,
            resource_type: originalExternalRelation.resource_type || null,
            source_id: newStagingResource.id,
            target: originalExternalRelation.target,
            target_type: originalExternalRelation.target_type,
            type: originalExternalRelation.type,
          },
        });
      }

      // clone the internal relations
      const originalInternalRelations = await prisma.internalRelation.findMany({
        where: {
          source_id: originalResource.id,
        },
      });

      for (const originalInternalRelation of originalInternalRelations) {
        await prisma.stagingInternalRelation.create({
          data: {
            action: "cloned",
            mirror: originalInternalRelation.mirror,
            original_source_id: originalResource.id,
            original_target_id: originalInternalRelation.target_id,
            resource_type: originalInternalRelation.resource_type,
            source_id: newStagingResource.id,
            target_id: originalInternalRelation.target_id,
            type: originalInternalRelation.type,
          },
        });
      }
    }

    return {
      statusCode: 201,
      version: draftVersion,
    };
  }

  // if there is a draft version, return it
  return {
    statusCode: 200,
    version: latestVersion,
  };
});
