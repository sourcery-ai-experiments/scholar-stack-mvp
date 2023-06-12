import { z } from "zod";
import { customAlphabet } from "nanoid";
import calver from "calver";
import protectRoute from "../../../utils/protectRoute";
import prisma from "../../../utils/prisma";

// @ts-ignore
import { serverSupabaseUser } from "#supabase/server";

const nanoid = customAlphabet(
  "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
);

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const { pidentifier } = event.context.params as { pidentifier: string };

  const bodySchema = z.object({
    links: z
      .array(
        z
          .object({
            id: z.string(),
            name: z.string(),
            action: z
              .union([
                z.literal("create"),
                z.literal("update"),
                z.literal("target_update"),
                z.literal("delete"),
              ])
              .optional(),
            description: z.string(),
            target: z.string(),
            type: z.string(),
          })
          .strict()
      )
      .min(1),
    releaseNotes: z.string().min(1),
  });

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

  const user = await serverSupabaseUser(event);
  const authorId: string = user?.id;

  // verify that the user is the author of the project
  const project = await prisma.project.findUnique({
    where: { identifier: pidentifier },
  });

  if (!project) {
    throw createError({
      message: "The provided project does not exist",
      statusCode: 400,
    });
  }

  if (project.authorId !== authorId) {
    throw createError({
      message: "You are not the author of this project",
      statusCode: 403,
    });
  }

  const allLinks = parsedBody.data.links as QueryLinksListItem[];

  const createNewVersion = allLinks.some((link) => {
    if (
      "action" in link &&
      (link.action === "create" ||
        link.action === "target_update" ||
        link.action === "delete")
    ) {
      return true;
    }
    return false;
  });

  const linksToUpdate = allLinks.filter((link) => {
    if ("action" in link && link.action === "update") {
      return true;
    }
    return false;
  });

  const linksToAdd = allLinks.filter((link) => {
    if ("action" in link && link.action === "create") {
      return true;
    }
    return false;
  });

  const linksToKeep = allLinks.filter((link) => {
    if (!("action" in link)) {
      return true;
    }
    return false;
  });

  for (const link of linksToUpdate) {
    const linkToUpdate = await prisma.link.findUnique({
      where: { id: link.id },
    });

    if (!linkToUpdate) {
      throw createError({
        message: "The provided link does not exist",
        statusCode: 400,
      });
    }

    await prisma.link.update({
      data: {
        name: link.name,
        description: link.description,
        icon: link.type === "doi" ? "academicons:doi" : "uil:link",
        type: link.type,
      },
      where: { id: link.id },
    });
  }

  if (createNewVersion) {
    // get the latset version of the project
    const latestVersion = await prisma.version.findFirst({
      orderBy: { created: "desc" },
      where: { projectId: project.id },
    });

    const latestVersionName = latestVersion?.name || "";

    /**
     * Mark the old version as not latest
     * TODO: figure if this key even needs to exist
     */
    if (latestVersion) {
      await prisma.version.update({
        data: { latest: false },
        where: { id: latestVersion.id },
      });
    }

    const newVersionName = calver.inc(
      "yy.mm.minor",
      latestVersionName,
      "calendar.minor"
    );

    const linksToConnect = [...linksToKeep, ...linksToAdd];

    console.log(linksToConnect);

    // const newVersion = {
    //   name: newVersionName,
    //   identifier: `ver${nanoid()}`,
    // };

    const newVersion = await prisma.version.create({
      data: {
        name: newVersionName,
        changes: parsedBody.data.releaseNotes,
        identifier: `ver${nanoid()}`,
        latest: true,
        links: {
          connectOrCreate: linksToConnect.map((link) => {
            return {
              create: {
                name: link.name,
                description: link.description,
                icon: link.type === "doi" ? "academicons:doi" : "uil:link",
                target: link.target,
                type: link.type,
              },
              where: { id: link.id },
            };
          }),

          // create: linksToAdd.map((link) => {
          //   return {
          //     name: link.name,
          //     description: link.description,
          //     icon: link.type === "doi" ? "academicons:doi" : "uil:link",
          //     target: link.target,
          //     type: link.type,
          //   };
          // }),
        },
        projectId: project.id,
      },
    });

    console.log(newVersion);

    return {
      body: JSON.stringify({
        identifier: newVersion.identifier,
        status: "new-version-created",
        version: newVersion.name,
      }),
      statusCode: 200,
    };
  } else {
    return {
      body: JSON.stringify({
        status: "no-new-version",
      }),
      statusCode: 200,
    };
  }
});
