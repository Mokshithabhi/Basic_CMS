"use client";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import { Editor } from "@/components/editor/Editor";
import Header from "@/components/header";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import ActiveCollaborators from "./activeCollaborators";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import Image from "next/image";
import { UpdateDocument } from "@/lib/actions/room.actions";
import Loader from "./Loader";
import ShareModal from "./shareModal";

const Room = ({
  roomId,
  roomMetadata,
  users,
  currentUserType,
}: CollaborativeRoomProps) => {
  const [documentTitle, setdocumentTitle] = useState(roomMetadata?.title);
  const [editing, setEditing] = useState<Boolean>(false);
  const [loading, setLoading] = useState<Boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const updateTitleHandler = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      setLoading(true);
      try {
        if (documentTitle !== roomMetadata?.title) {
          const updatedDocument = await UpdateDocument(roomId, documentTitle);
          if (updatedDocument) {
            setEditing(false);
          }
        }
      } catch (e) {
        console.error(`Error while editing the title:${e}`);
      }
      setLoading(false);
    }
  };
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef?.current &&
        !containerRef?.current.contains(e.target as Node)
      ) {
        setEditing(false);
        UpdateDocument(roomId, documentTitle);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [roomId, documentTitle]);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef?.current?.focus();
    }
  }, [editing]);
  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room"></div>
        <Header>
          <div
            ref={containerRef}
            className="flex w-fit items-center justify-center gap-2"
          >
            {editing && !loading ? (
              <Input
                type="text"
                value={documentTitle}
                ref={inputRef}
                onChange={(e) => setdocumentTitle(e.target.value)}
                placeholder="Enter title"
                onKeyDown={updateTitleHandler}
                disabled={!editing}
                className="document-title-input"
              />
            ) : (
              <>
                <p className="document-title">{documentTitle}</p>
              </>
            )}
            {currentUserType === "editor" && !editing && (
              <Image
                src="/assets/icons/edit.svg"
                alt="edit"
                width={24}
                height={24}
                onClick={() => setEditing(true)}
                className="pointer"
              />
            )}
            {currentUserType !== "editor" && !editing && (
              <p className="view-only-tag">View Only</p>
            )}
            {loading && <p className="text-sm text-grey-400">saving...</p>}
          </div>
          <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
            <ActiveCollaborators />
            <ShareModal
              roomId={roomId}
              collaborators={users}
              creatorId={roomMetadata.creatorId}
              currentUserType={currentUserType}
            />
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </Header>
        <Editor roomId={roomId} currentUserType={currentUserType} />
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default Room;
