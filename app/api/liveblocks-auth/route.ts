import { liveblocks } from "@/lib/liveBlocks";
import { getUserColor } from "@/lib/utils";
import { currentUser, EmailAddress } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";



export async function POST(request: Request) {
  // Get the current user from your database
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const {id,firstName,emailAddresses,imageUrl,lastName} = clerkUser;

  const user= {
    id:id,
    info:{
        id:id,
        name:`${firstName} ${lastName}`,
        email:emailAddresses[0].emailAddress,
        avator:imageUrl,
        color: getUserColor(id)
    }
  }

  const { status, body } = await liveblocks.identifyUser(
    {
      userId: user.info.email,
      groupIds:[], // Optional
    },
    { userInfo: user.info }
  );

  return new Response(body, { status });
}
