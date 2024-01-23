import { z } from "zod";
import { customAlphabet } from "nanoid";
import protectRoute from "~/server/utils/protectRoute";
import prisma from "~/server/utils/prisma";
import { projectTransformer } from "~/server/transformers/project";

import { serverSupabaseUser } from "#supabase/server";

const nanoid = customAlphabet(
  "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
);

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const bodySchema = z
    .object({
      name: z.string().min(1),
      description: z.string(),
      image: z.string().url().optional(),
      tags: z.array(z.string()).min(1),
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

  const user = await serverSupabaseUser(event);
  const authorId = user?.id as string;

  let identifier = `prj${nanoid(6)}`;

  // Check if the identifier is already taken
  while (await prisma.project.findUnique({ where: { identifier } })) {
    identifier = `prj${nanoid(6)}`;
  }

  const project = await prisma.project.create({
    data: {
      name: parsedBody.data.name,
      author_id: authorId,
      description: parsedBody.data.description,
      identifier,
      image:
        parsedBody.data.image ||
        `https://api.dicebear.com/6.x/shapes/svg?seed=${encodeURIComponent(
          parsedBody.data.name,
        )}`,
      tags: parsedBody.data.tags,
    },
  });

  return {
    body: JSON.stringify(projectTransformer(project)),
    statusCode: 200,
  };
});
