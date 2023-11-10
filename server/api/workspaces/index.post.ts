import { z } from "zod";
import { nanoid } from "nanoid";

import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const bodySchema = z
    .object({
      title: z.string().min(1),
      description: z.string(),
      personal: z.boolean().optional(),
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
      personal: parsedBody.data.personal || false,
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
    workspace: {
      id: workspace.id,
      title: workspace.title,
      created: workspace.created,
      description: workspace.description,
      personal: workspace.personal,
      updated: workspace.updated,
    },
  };
});
