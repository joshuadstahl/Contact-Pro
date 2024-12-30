import { User, userStatus } from "@/app/classes/user";
import { auth } from "@/auth";
import {Collection, Db, MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { ServerUser } from "@/app/classes/serverUser";
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
            
        } catch (err) {
            return NextResponse.json({ message: "Unable to fetch profile.", err:{err}}, { status: 500 });
        }
        
    }
    return NextResponse.json({ message: "Not authorized" }, { status: 401 })
}
