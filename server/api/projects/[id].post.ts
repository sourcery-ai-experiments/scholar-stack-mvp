import { z } from "zod";
import { customAlphabet } from "nanoid";
import protectRoute from "../../utils/protectRoute";
import prisma from "../../utils/prisma";

// @ts-ignore
import { serverSupabaseUser } from "#supabase/server";

const nanoid = customAlphabet(
  "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
);

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const bodySchema = z.object({
    links: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          target: z.string(),
          type: z.string(),
        })
      )
      .min(1),
    projectId: z.string().min(1),
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
    where: { id: parsedBody.data.projectId },
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

  const linkIds = [];

  if (createNewVersion) {
    for (const link of linksToAdd) {
      const newLink = await prisma.link.create({
        data: {
          name: link.name,
          description: link.description,
          icon: link.type === "doi" ? "academicons:doi" : "uil:link",
          target: link.target,
          type: link.type,
        },
      });

      linkIds.push(newLink.id);
    }
  }

  /**
   * TODO: figure this mess out with the new many to many relationship
   */

  for (const link of linksToUpdate) {
    const updatedLink = await prisma.link.update({
      data: {
        name: link.name,
        description: link.description,
        icon: link.type === "doi" ? "academicons:doi" : "uil:link",
        type: link.type,
      },
      where: { id: link.id },
    });

    linkIds.push(updatedLink.id);
  }

  // get the latset version of the project
  const latestVersion = await prisma.version.findFirst({
    orderBy: { created: "desc" },
    where: { projectId: project.id },
  });

  const identifier = nanoid();
  console.log(parsedBody.data.links);

  return {
    body: JSON.stringify({
      status: "new-version",
      version: "3.0.0",
    }),
    statusCode: 200,
  };
});
