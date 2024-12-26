import { User, userStatus } from "@/app/classes/user";
import { auth } from "@/auth";
import {Collection, Db, MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { ServerUser } from "@/app/classes/serverUser";


export const GET = async function GET() {
    let session = await auth();
    if (session) {
        try {
            const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING ?? "");
            await client.connect();
            const db: Db = client.db(process.env.DB_NAME ?? "");

            const userCollection: Collection = db.collection("users");

            let user = await userCollection.findOne<ServerUser>({email: session?.user?.email});

            if (user === null) {
                console.log("no user!");
                await client.close();
                return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
            }
            else {

                const friendsCollection : Collection = db.collection("friends");
                
                let friends = await friendsCollection.findOne({_id: new ObjectId(user._id)});

                let newFriends : Array<User> = []; //a new array of users from the friends (user objects) from the database.
                if (friends !== null) {
                    for (let i = 0; i < friends.friends.length; i++) {
                        let usr = new ServerUser(friends.friends[i]).export(user._id.toString());
                        newFriends.push(usr);
                    }
                }

                let out = {
                    friends: newFriends,
                };

                await client.close();

                return NextResponse.json(out);
            }

            
        } catch (err) {
            return NextResponse.json({ message: "Unable to fetch profile.", err:{err}}, { status: 500 });
        }
        
    }
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
}
