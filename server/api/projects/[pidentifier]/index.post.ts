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

// Zod schema for the request body
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
              z.literal("delete"),
            ])
            .optional(),
          description: z.string(),
          icon: z.string(),
          target: z.string(),
          type: z.string(),
        })
        .strict()
    )
    .min(1),
  releaseNotes: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const { pidentifier } = event.context.params as { pidentifier: string };

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

  // throw error if the body is invalid
  if (!parsedBody.success) {
    console.log(parsedBody.error);

    throw createError({
      message: "The provided parameters are invalid",
      statusCode: 400,
    });
  }

  // authenticate the user
  const user = await serverSupabaseUser(event);
  const authorId: string = user?.id as string;

  // verify that the user is the author of the project
  const project = await prisma.project.findUnique({
    where: { identifier: pidentifier },
  });

  // throw error if the project does not exist
  if (!project) {
    throw createError({
      message: "The provided project does not exist",
      statusCode: 400,
    });
  }

  // throw error if the user is not the author of the project
  if (project.author_id !== authorId) {
    throw createError({
      message: "You are not the author of this project",
      statusCode: 403,
    });
  }

  // get all the links
  const allLinks = parsedBody.data.links as QueryLinksListItem[];

  // filter links that have an `update` action
  const linksWithUpdateAction = allLinks.filter((link) => {
    if ("action" in link && link.action === "update") {
      return true;
    }

    return false;
  });

  // Get the original links from the database
  const originalLinks = await prisma.link.findMany({
    where: { id: { in: linksWithUpdateAction.map((link) => link.id) } },
  });

  // throw error if the number of links in the database and the number of links in the request body do not match
  if (originalLinks.length !== linksWithUpdateAction.length) {
    throw createError({
      message: "The provided links do not exist",
      statusCode: 400,
    });
  }

  // filter links that have an `update` action and the target HAS NOT changed
  const linksToUpdateWithoutTargetChange = linksWithUpdateAction.filter(
    (link) => {
      const originalLink = originalLinks.find(
        (originalLink) => originalLink.id === link.id
      );

      if (originalLink?.target === link.target) {
        return true;
      }

      return false;
    }
  );

  /**
   * TODO: see if we can use set operations to make this more efficient
   */

  // filter links that have an `update` action and the target HAS changed
  const linksToUpdateWithTargetChange = linksWithUpdateAction.filter((link) => {
    const originalLink = originalLinks.find(
      (originalLink) => originalLink.id === link.id
    );

    if (originalLink?.target !== link.target) {
      return true;
    }

    return false;
  });

  // filter links that have a `create` action
  const linksWithCreateAction = allLinks.filter((link) => {
    if ("action" in link && link.action === "create") {
      return true;
    }
    return false;
  });

  // filter links that have a `delete` action
  const linksWithDeleteAction = allLinks.filter((link) => {
    if ("action" in link && link.action === "delete") {
      return true;
    }
    return false;
  });

  /**
   * filter links that do not have an `action` key
   * These links will be carried forward if there is a new version
   */
  const linksToKeep = allLinks.filter((link) => {
    if (!("action" in link)) {
      return true;
    }
    return false;
  });

  // Update the links that have an `update` action and the target HAS NOT changed
  for (const link of linksToUpdateWithoutTargetChange) {
    /**
     * TODO: figure out if this is needed.
     * We already have the original links from the database
     */
    // const linkToUpdate = await prisma.link.findUnique({
    //   where: { id: link.id },
    // });

    // if (!linkToUpdate) {
    //   throw createError({
    //     message: "The provided link does not exist",
    //     statusCode: 400,
    //   });
    // }

    /**
     * TODO: store activity
     */

    await prisma.link.update({
      data: {
        name: link.name,
        description: link.description,
        icon: link.icon,
        type: link.type,
      },
      where: { id: link.id },
    });
  }

  // check if a new version needs to be created
  const createNewVersion =
    linksToUpdateWithTargetChange.length > 0 ||
    linksWithCreateAction.length > 0 ||
    linksWithDeleteAction.length > 0;

  if (createNewVersion) {
    // get the latset version of the project
    const latestVersion = await prisma.version.findFirst({
      orderBy: { created: "desc" },
      where: { project_id: project.id },
    });

    const latestVersionName = latestVersion?.name.trim() || "";

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

    // increment the version name
    const newVersionName = calver.inc(
      "yyyy.ww.minor",
      latestVersionName,
      "calendar.minor"
    );

    // remove the id from the links that have a target change
    for (const link of linksToUpdateWithTargetChange) {
      link.id = nanoid();
    }

    // get the links that need to be connected to the new version
    const linksToConnect = [
      ...linksToKeep,
      ...linksWithCreateAction,
      ...linksToUpdateWithTargetChange,
    ];

    const newVersion = await prisma.version.create({
      data: {
        name: newVersionName,
        changes: parsedBody.data.releaseNotes.trim(),
        identifier: `v${nanoid(7)}`,
        latest: true,
        links: {
          connectOrCreate: linksToConnect.map((link) => {
            return {
              create: {
                name: link.name,
                description: link.description,
                icon: link.icon,
                target: link.target,
                type: link.type,
              },
              where: { id: link.id },
            };
          }),
        },
        project_id: project.id,
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
