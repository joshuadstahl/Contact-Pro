import { auth } from "@/auth";
import {Collection, Db, MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { ServerUser } from "@/app/classes/serverUser";
import { ServerFriendRequest } from "@/app/classes/serverFriendRequests";
import { CreateDbConnection } from "@/app/functions/serverFunctions";

export const GET = async function GET() {
    let session = await auth();
    if (session) {
        try {
            const [db, client] = await CreateDbConnection();

            const userCollection: Collection = db.collection("users");

            let user = await userCollection.findOne<ServerUser>({email: session?.user?.email});

            if (user === null) {
                await client.close();
                return NextResponse.json({ message: "Unauthorized. No account exists." }, { status: 401 })
            }
            
            const friendRequestsCollection : Collection = db.collection("friendRequests");
                
            let friendRequests = friendRequestsCollection.find<ServerFriendRequest>({$or: [{"recipient._id": new ObjectId(user._id.toString())}, {"sender._id": new ObjectId(user._id.toString())}]});


            let newFriendRequests : Array<ServerFriendRequest> = []; //a new array of friend requests from the friend requests objects from the database.
            for await (const doc of friendRequests) {
                let temp = new ServerFriendRequest({...doc});
                temp = temp.export(user._id.toString());
                newFriendRequests.push(temp);
            }

            let out = {
                data: newFriendRequests,
            };

            await client.close();

            return NextResponse.json(out);
            
        } catch (err) {
            console.log(err);
            return NextResponse.json({ message: "Unable to fetch friend requests.", err:{err}}, { status: 500 });
        }
        
    }
    return NextResponse.json({ message: "Not authorized" }, { status: 401 });
}