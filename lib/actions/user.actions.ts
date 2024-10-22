"use server";

import { clerkClient, EmailAddress } from "@clerk/nextjs/server";
import { parseStringify } from "../utils";
import { liveblocks } from "../liveBlocks";

export const getClerkUser = async ({ userIds }: { userIds: string[] }) => {
  try {
    const { data } = await clerkClient.users.getUserList({
      emailAddress: userIds,
    });
    const users = data.map((user) => ({
      id: user.id,
      name: `${user?.firstName} ${user?.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      avator: user.imageUrl,
    }));
    const sortedUsers = userIds.map((email) =>
      users.find((user) => user.email === email)
    );
    return parseStringify(sortedUsers);
  } catch (e) {
    console.error(`error fetching: ${e}`);
  }
};

export const getDocumentUsers = async ({
  roomId,
  currentUser,
  text,
}: {
  roomId: string;
  currentUser: string;
  text: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    const access = room.usersAccesses || {};
    const users = Object.keys(access).filter((email) => email !== currentUser);
    if (text.length) {
      const lowerCaseText = text.toLowerCase();
      const filteredUsers = users.filter((email: string) =>
        email.toLowerCase().includes(lowerCaseText)
      );
      return parseStringify(filteredUsers);
    }
    return parseStringify(users);
  } catch (e) {
    console.error(`Error while fetching Document Users:${e}`);
  }
};
