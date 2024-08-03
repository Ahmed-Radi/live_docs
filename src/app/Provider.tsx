"use client";

import Loader from "@/components/Loader";
import { getClerkUsers, getDocumentUsers } from "@/lib/actions/user.actions";
import { useUser } from "@clerk/nextjs";
import {
	ClientSideSuspense,
	LiveblocksProvider,
} from "@liveblocks/react/suspense";

function Provider({ children }: { children: React.ReactNode }) {
	const { user: clerkUser } = useUser();

	return (
		// publicApiKey={"pk_dev_AxAnvf6EAbECSsrsv2KjGl5dS3jf7dXqoxmZfSbnrwuK4GxMwXDNEgrZ2tK5eqmD"}
		<LiveblocksProvider
			authEndpoint='/api/liveblocks-auth'
			resolveUsers={async ({ userIds }: { userIds: string[] }) => {
				const users = await getClerkUsers({ userIds });
				return users;
			}}
			resolveMentionSuggestions={async ({ text, roomId }) => {
				const roomUser = await getDocumentUsers({
					roomId,
					currentUser: clerkUser?.emailAddresses[0]?.emailAddress!,
					text,
				});

				return roomUser;
			}}>
			{/* <RoomProvider id="my-room"> */}
			<ClientSideSuspense fallback={<Loader />}>
				{children}
			</ClientSideSuspense>
			{/* </RoomProvider> */}
		</LiveblocksProvider>
	);
}

export default Provider;
