import { Editor } from "@/components/editor/Editor";
import Header from "@/components/header";
import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Room from "@/components/Room";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUser } from "@/lib/actions/user.actions";

const DocumentIds = async ({ params: { id } }: SearchParamProps) => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  const room = await getDocument({
    roomId: id,
    userId: clerkUser?.emailAddresses[0].emailAddress,
  });

  if (!room) redirect("/");
  const usersAccessess = room?.usersAccesses|| {}
  const userIds = Object.keys(usersAccessess);
  const users = await getClerkUser({ userIds });
  
  const userData = users.map((user: User) => ({
    ...user,
    userType: usersAccessess[user.email]?.includes("room:write")
      ? "editor"
      : "viewer",
  }));
  const currentUserType = usersAccessess[
    clerkUser?.emailAddresses[0].emailAddress
  ]?.includes("room:write")
    ? "editor"
    : "viewer";
  return (
    <main className="flex w-full items-center flex-col">
      <Room
        roomId={id}
        roomMetadata={room.metadata}
        users={userData}
        currentUserType={currentUserType}
      />
    </main>
  );
};

export default DocumentIds;
