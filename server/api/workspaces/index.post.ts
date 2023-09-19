import { z } from "zod";
import { nanoid } from "nanoid";
// import protectRoute from "../../utils/protectRoute";
import prisma from "../../utils/prisma";

import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  // await protectRoute(event);

  const bodySchema = z
    .object({
      title: z.string().min(1),
      description: z.string(),
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
  const userid = (user?.id as string) || "16df9f62-71f3-442a-ac47-8142e63ded77";

  const workspaceId = nanoid();

  const workspace = await prisma.workspace.create({
    data: {
      id: workspaceId,
      title: parsedBody.data.title,
      Access: {
        create: {
          role: "owner",
          user_id: userid,
        },
      },
      description: parsedBody.data.description,
    },
  });

  if (!workspace) {
    throw createError({
      message: "Failed to create workspace",
      statusCode: 500,
    });
  }

  return {
    statusCode: 201,
    workspaceId,
  };
});
