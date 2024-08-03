"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import { Editor } from "@/components/editor/Editor";
import Header from "@/components/Header";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Loader from "./Loader";
import ActiveCollaborators from "./ActiveCollaborators";
import { Input } from "./ui/input";
import Image from "next/image";
import { updateDocument } from "@/lib/actions/room.actions";
import ShareModal from "./ShareModal";

const CollaborativeRoom = ({
  roomId,
  roomMetadata,
  users,
  currentUserType
}: CollaborativeRoomProps) => {
  const [documentTitle, setDocumentTitle] = useState(roomMetadata?.title)
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDocumentTitle(roomMetadata?.title)
  },[roomMetadata?.title])

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitleHandler =  async (e: KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter') {
      setLoading(true)
      try {
        if(documentTitle !== roomMetadata?.title) {
          // update title
          const updatedDocument = await updateDocument({ roomId, title: documentTitle });
          if(updatedDocument) {
            setEditing(false)
          }
        }
      } catch (error) {
        console.error('error', error)
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if(editing && inputRef.current) {
      inputRef.current.focus()
    }
  } ,[editing])
  useEffect(() => {
    const handleClickOutSide = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current?.contains(e.target as Node)) {
        setEditing(false)
        updateDocument({ roomId, title: documentTitle });
      }
    }
    document.addEventListener('mousedown', handleClickOutSide)

    return () => {document.removeEventListener('mousedown', handleClickOutSide)}
  } ,[documentTitle, roomId])

  return (
		<RoomProvider id={roomId}>
			<ClientSideSuspense fallback={<Loader />}>
				<div className='collaborative-room'>
					<Header>
						<div ref={containerRef} className='flex w-fit items-center justify-center gap-2'>
							{editing && !loading ? (<Input
                type="text"
                value={documentTitle}
                ref={inputRef}
                onChange={
                  (e) => setDocumentTitle(e.target.value)
                }
                onKeyDown={updateTitleHandler}
                disabled={!editing}
                className="document-title-input"
              />) : (<p className='document-title'>{documentTitle}</p>)}
              {currentUserType === "editor" && !editing && (
                <Image
                  src={"/assets/icons/edit.svg"}
                  alt="edit button"
                  width={24}
                  height={24}
                  onClick={() => setEditing(true)}
                  className="pointer"
                />
              )}
              {currentUserType !== "editor" && !editing && (
                <p className="view-only-tag">View only</p>
              )}

              {loading && <p className="text-sm text-gray-400">saving...</p>}

						</div>
						<div className='flex w-full flex-1 justify-end gap-2 sm:gap-3'>
							<ActiveCollaborators />

              <ShareModal
                roomId={roomId}
                collaborators={users}
                creatorId={roomMetadata?.creatorId}
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
				</div>
			</ClientSideSuspense>
		</RoomProvider>
	);
};

export default CollaborativeRoom;
