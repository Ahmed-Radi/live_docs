import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function Document({
  params: { id }
}: SearchParamProps) {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const room = await getDocument({ roomId: id, userId: clerkUser.emailAddresses[0].emailAddress });

  if(!room) redirect('/');

  const userIds = Object.keys(room.usersAccesses);
  const user = await getClerkUsers({ userIds });

  const userData = user.map((user: User)=> ({
    ...user,
    userType: room.usersAccesses[user?.email]?.includes('room:write') ? 'editor' : 'viewer'
  }))

  const currentUserType = room.usersAccesses[clerkUser.emailAddresses[0].emailAddress]?.includes('room:write') ? 'editor' : 'viewer'

	return (
		<div className='flex w-full flex-col items-center'>
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata}
        users={userData}
        currentUserType={currentUserType}
      />
		</div>
	);
}

export default Document;
