import { auth } from "@/auth";
import { MongoClient, Collection, Db, FindCursor, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { User } from "@/app/classes/user";
import { ServerChat } from "@/app/classes/serverChats";
import { Chat } from "@/app/classes/chats";


//this sends out the chats for a user
export const GET = auth(async function GET(req) {
    if (req.auth) {
        let session = req.auth;
        const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING ?? "");
        await client.connect();
        const db: Db = client.db(process.env.DB_NAME ?? "");

        const userCollection: Collection = db.collection("users");

        let user = await userCollection.findOne<User>({email: session?.user?.email});

        let chatsOut = new Array<Object>;

        let signUp = false;
        if (user === null) {
            console.log("no user!");
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }
        else {
            const chatDb: Db = client.db(process.env.DB_NAME ?? "");
            const chatCollection: Collection<ServerChat> = chatDb.collection<ServerChat>("chats");
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
                    accessingUser: user.username
                }
            )

            for await (const doc of chats) {
                let temp = new ServerChat(doc as ServerChat);
                chatsOut.push(temp.export(user._id.toString()));
            }

            
        }

        let out = {
            chats: chatsOut
        };

        client.close();

        return NextResponse.json(out, {status: 200});
    }
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
})