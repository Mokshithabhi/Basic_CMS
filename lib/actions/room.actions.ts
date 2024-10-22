"use server";
import { nanoid } from "nanoid";
import { liveblocks } from "../liveBlocks";
import { revalidatePath } from "next/cache";
import { getAccessType, parseStringify } from "../utils";
import { redirect } from "next/navigation";

export const createDocument = async ({
  userId,
  email,
}: CreateDocumentParams) => {
  const roomId = nanoid();
  try {
    const metadata = {
      creatorId: userId,
      email,
      title: "Untitled Document",
    };
    const usersAccesses: RoomAccesses = {
      [email]: ["room:write"],
    };
    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: [],
    });
    revalidatePath("/");
    return parseStringify(room);
  } catch (e) {
    console.error(e);
  }
};

export const getDocument = async ({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    const hasAccess = Object.keys(room.usersAccesses).includes(userId);
    if (!hasAccess) {
      throw new Error(`Do not have access for this document`);
    }
    return parseStringify(room);
  } catch (e) {
    console.error(`Error fetching the document:${e}`);
  }
};

export const getAllDocuments = async (email: string) => {
  try {
    const rooms = await liveblocks.getRooms({ userId: email });
    return parseStringify(rooms);
  } catch (e) {
    console.error(`Error fetching list of documents:${e}`);
  }
};

export const UpdateDocument = async (roomId: string, title: string) => {
  try {
    const updateRoom = await liveblocks.updateRoom(roomId, {
      metadata: {
        title,
      },
    });
    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updateRoom);
  } catch (e) {
    console.error(`Error while updating the title:${e}`);
  }
};

export const updateDocumentAccess = async ({
  roomId,
  email,
  userType,
  updatedBy,
}: ShareDocumentParams) => {
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,
    };
    const room = await liveblocks.updateRoom(roomId, {
      usersAccesses,
    });
    if (room) {
      const notificationId = nanoid()
      await liveblocks.triggerInboxNotification({
        userId:email,
        kind:'$documentAccess',
        subjectId:notificationId,
        activityData:{
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy:updatedBy.name,
          avatar:updatedBy.avator,
          email:updatedBy.email
        },
        roomId
      })
    }
    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (e) {
    console.error(`Error generated while permissions:${e}`);
  }
};

export const removeCollaborator = async ({
  roomId,
  email,
}: {
  roomId: string;
  email: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    if (room.metadata.email === email) {
      throw new Error("You can not remove yourself");
    }
    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null,
      },
    });
    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updatedRoom);
  } catch (e) {
    console.error(e);
  }
};

export const deleteDocument = async (roomId: string) => {
  try {
    await liveblocks.deleteRoom(roomId);
    revalidatePath("/");
    redirect("/");
  } catch (e) {
    console.error(`Error in deleting the modal:${e}`);
  }
};
