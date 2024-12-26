import { User, userStatus } from "@/app/classes/user";
import { auth } from "@/auth";
import {Collection, Db, MongoClient } from "mongodb";
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

            let signUp = false;
            if (user === null) {
                console.log("no user!");
                signUp = true;
                let newU = new ServerUser(
                    {
                        name: session?.user?.name ?? "", 
                        photo: session?.user?.image ?? "/static/noPhoto.png",
                        status: userStatus.ONLINE,
                        email: session?.user?.email ?? "",
                        username: session?.user?.email ?? "",
                        savedStatus: null,
                        friends: []
                    }
                );
                let res = await userCollection.insertOne({...newU, _id:undefined});
                newU._id = res.insertedId.toString(); //assign the new id to the object.
                user = newU;
            }

            let out = {
                user: new User({...user, status:user.savedStatus === null ? user.status : user.savedStatus}),
                friends: user.friends,
                newUser: signUp
            };

            await client.close();

            return NextResponse.json(out);
        } catch (err) {
            return NextResponse.json({ message: "Unable to fetch profile.", err:{err}}, { status: 500 });
        }
        
    }
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
}
