import AddDocumentBtn from "@/components/AddDocumentBtn";
import { DeleteModal } from "@/components/DeleteModal";
import Header from "@/components/Header";
import { Notifications } from "@/components/Notifications";
import { getDocuments } from "@/lib/actions/room.actions";
import { dateConverter } from "@/lib/utils";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

async function Home () {
	const clerkUser = await currentUser();

  if (!clerkUser) redirect('/sign-in');

  const roomDocuments = await getDocuments(clerkUser.emailAddresses[0].emailAddress);

	return (
		<main className='home-container'>
			<Header className='sticky top-0 left-0'>
				<div className='flex items-center gap-2 xl:gap-4'>
					<Notifications />
					<SignedIn>
						<UserButton />
					</SignedIn>
				</div>
			</Header>
				{roomDocuments.data.length > 0 ? (
					<div className="document-list-container">
            <div className="document-list-title">
              <h3 className="text-28-semibold">All Documents</h3>
              <AddDocumentBtn userId={clerkUser.id} email={clerkUser.emailAddresses[0].emailAddress} />
            </div>
            <ul className="document-ul">
              {roomDocuments.data.map(({ id, metadata, createdAt }: any) => (
                <li key={id} className="document-list-item">
                  <Link href={`/documents/${id}`} className="flex flex-1 items-center gap-4">
                    <div className="hidden rounded-md bg-dark-500 p-2 sm:block">
                      <Image
                        src={"/assets/icons/doc.svg"}
                        alt="file"
                        height={40}
                        width={40}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="line-clamp-1 text-lg">{metadata.title}</p>
                      <p className="text-sm font-light text-blue-100">Create about {dateConverter(createdAt)}</p>
                    </div>
                  </Link>
                  <DeleteModal roomId={id} />
                </li>
              ))}
            </ul>
          </div>
				) : (
					<div className='document-list-empty'>
						<Image
							src='/assets/icons/doc.svg'
							width={40}
							height={40}
							className='max-auto'
							alt='document'
						/>
            <AddDocumentBtn
              userId={clerkUser.id}
              email={clerkUser.emailAddresses[0].emailAddress}
            />
					</div>
				)}
		</main>
	);
}

export default Home;