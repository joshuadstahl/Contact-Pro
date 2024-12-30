import { auth } from "@/auth";
import { MongoClient, Collection, Db, FindCursor, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { User } from "@/app/classes/user";
import { ServerChat } from "@/app/classes/serverChats";
import { Chat } from "@/app/classes/chats";
import { CreateDbConnection } from "@/app/functions/serverFunctions";


//this sends out the chats for a user
export const GET = async function GET() {
    let session = await auth();
    if (session) {
        //let session = req.auth;
        const [db, client] = await CreateDbConnection();

        const userCollection: Collection = db.collection("users");

        let user = await userCollection.findOne<User>({email: session?.user?.email});

        let chatsOut = new Array<Object>;

        let signUp = false;
        if (user === null) {
            await client.close();
            return NextResponse.json({ message: "Unauthorized. No account exists." }, { status: 401 })
        }

        const chatCollection: Collection<ServerChat> = db.collection<ServerChat>("chats");
        let chats = chatCollection.find<ServerChat>({membersArray: new ObjectId(user._id)}).project(
            {
                _id: 1,
                chatType: 1,
                members: 1,
                photo: 1,
                name: 1,
                membersArray: 1,
                messages: 1,
                recipientStatuses: 1,
                accessingUser: user._id.toString()
            }
        )

        for await (const doc of chats) {
            let temp = new ServerChat(doc as ServerChat);
            chatsOut.push(temp.export(user._id.toString()));
        }

        let out = {
            chats: chatsOut
        };

        await client.close();
        return NextResponse.json(out, {status: 200});
    }
    return NextResponse.json({ message: "Not authorized" }, { status: 401 })
}