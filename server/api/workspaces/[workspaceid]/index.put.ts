import { z } from "zod";
import protectRoute from "../../../utils/protectRoute";
import prisma from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

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

  /**
   * TODO Add middleware file to see if user is a member of the workspace
   */

  // const user = await serverSupabaseUser(event);
  // const userid = user?.id as string;

  const { workspaceid } = event.context.params as { workspaceid: string };

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceid },
  });

  if (!workspace) {
    throw createError({
      message: "Workspace not found",
      statusCode: 404,
    });
  }

  const { title, description } = parsedBody.data;

  const updatedWorkspace = await prisma.workspace.update({
    data: {
      title,
      description,
    },
    where: { id: workspaceid },
  });

  if (!updatedWorkspace) {
    throw createError({
      message: "Workspace not found",
      statusCode: 404,
    });
  }

  return {
    message: "Workspace updated",
    statusCode: 200,
  };
});
