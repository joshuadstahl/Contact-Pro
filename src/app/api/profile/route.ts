import { User, userStatus } from "@/app/components/util/classes";
import { auth } from "@/auth";
import {Collection, Db, MongoClient } from "mongodb";
import { NextResponse } from "next/server";


export const GET = auth(async function GET(req) {
    if (req.auth) {
        let session = req.auth;
        const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING ?? "");
        await client.connect();
        const db: Db = client.db(process.env.DB_NAME ?? "");

        const userCollection: Collection = db.collection("users");

        let user = await userCollection.findOne<User>({email: session?.user?.email});

        let signUp = false;
        if (user === null) {
            console.log("no user!");
            signUp = true;
            let newU = new User(
                {
                    name: session?.user?.name ?? "", 
                    photo: session?.user?.image ?? "/static/noPhoto.png",
                    status: userStatus.ONLINE,
                    email: session?.user?.email ?? "",
                    username: session?.user?.email ?? ""
                }
            );
            await userCollection.insertOne(newU);
            user = newU;
        }

        let out = {
            user: user,
            newUser: signUp
        };

        return NextResponse.json(out);
    }
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
})
