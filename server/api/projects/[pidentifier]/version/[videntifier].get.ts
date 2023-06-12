// @ts-ignore
import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  const { pidentifier, videntifier } = event.context.params as {
    pidentifier: string;
    videntifier: string;
  };

  if (!pidentifier || !videntifier) {
    throw createError({
      message: "Missing identifier",
      statusCode: 400,
    });
  }

  const project = await prisma.project.findUnique({
    include: {
      versions: {
        orderBy: { created: "desc" },
        select: {
          name: true,
          created: true,
          identifier: true,
        },
      },
    },
    where: { identifier: pidentifier },
  });

  if (!project) {
    throw createError({
      message: "Project not found",
      statusCode: 404,
    });
  }

  // check if the version exists in the project versions

  const versionExists = project.versions.find(
    (version) => version.identifier === videntifier
  );

  if (!versionExists) {
    throw createError({
      message: "Version not found",
      statusCode: 404,
    });
  }

  const responseProject: ResponseProjectVersion = {
    id: project.id,
    name: project.name,
    created: project.created.toISOString(),
    description: project.description,
    identifier: project.identifier,
    image: project.image,
    isAuthor: false,
    tags: project.tags,
    updated: project.updated.toISOString(),

    versionDetails: {},

    versions: project.versions.map((version) => {
      return {
        name: version.name,
        created: version.created.toISOString(),
        identifier: version.identifier,
      };
    }),
  };

  if (user?.id === project.authorId) {
    responseProject.isAuthor = true;
  }

  const versionData = await prisma.version.findUnique({
    include: {
      links: {
        orderBy: { created: "desc" },
      },
    },
    where: {
      identifier: videntifier,
    },
  });

  if (!versionData) {
    throw createError({
      message: "Version not found",
      statusCode: 404,
    });
  }

  const response = {
    ...responseProject,
    versionDetails: versionData || {},
  };

  return response;
});
