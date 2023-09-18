import protectRoute from "../../utils/protectRoute";
import prisma from "../../utils/prisma";

import { serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  await protectRoute(event);

  const user = await serverSupabaseUser(event);

  const userId = user?.id as string;
  const userEmail = user?.email as string;

  const userExists = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userExists) {
    const user = await prisma.user.create({
      data: {
        id: userId,
        username: userEmail, //

        name: "",
        affiliation: "",
        contact_email_address: "",
        email_address: userEmail,

        website: "",
      },
    });

    if (!user) {
      return {
        statusCode: 500,
      };
    }

    return {
      statusCode: 201,
    };
  }

  return {
    statusCode: 200,
  };
});
