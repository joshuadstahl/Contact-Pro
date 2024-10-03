import { auth } from "@/auth";
import { MongoClient, Collection, Db, FindCursor, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/app/classes/user";
import { ServerUser } from "@/app/classes/serverUser";


//this sends out the chats for a user
export const GET = async function GET(
    req: Request,
    { params }: { params: { username: string } }) {
    
    //make sure there is a valid session
    let session = await auth();
    if (session) {
        const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING ?? "");
        await client.connect();
        const db: Db = client.db(process.env.DB_NAME ?? "");

        const userCollection: Collection = db.collection("users");

        let user = await userCollection.findOne<User>({email: session?.user?.email});

        let outUser = new Object;

        if (user === null) {
            console.log("no user!");
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }
        else {
            
            //const userCollection: Collection<ServerChat> = db.collection<ServerChat>("users");
            let fetchedUser = await userCollection.findOne<ServerUser>({username: params.username ?? ""});

            if (fetchedUser !== null) {
                outUser = new ServerUser(fetchedUser).export(user._id);
            }
            else {
                return NextResponse.json({ message: "User not found" }, { status: 400 })
            }
            
        }

        client.close();

        return NextResponse.json(outUser, {status: 200});
    }
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
}