import { User, userStatus } from "@/app/classes/user";
import { auth } from "@/auth";
import {Collection, Db, MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async function PUT(req: NextRequest) {
    
    let session = await auth();
    if (session) {
        const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING ?? "");
        await client.connect();
        const db: Db = client.db(process.env.DB_NAME ?? "");

        const userCollection: Collection = db.collection("users");

        let user = await userCollection.findOne<User>({email: session?.user?.email});

        let signUp = false;
        if (user === null) {
            return NextResponse.json({ message: "No account" }, { status: 403 })
        }

        let body = await req.json();

        if ("username" in body) {
            if (body.username != user.username) {
                let lookup = await userCollection.findOne<User>({username: body.username});
                if (lookup === null) {
                    await userCollection.updateOne({username: user.username}, {$set: {username: body.username}});
                    client.close();
                    return NextResponse.json({ message: "Success"}, {status: 200});
                }
                else {
                    client.close();
                    return NextResponse.json({ message: "Username taken"}, {status: 403});
                }
            }
            client.close();
            return NextResponse.json({ message: "Success"}, {status: 200});
        }
        else {
            client.close();
            return NextResponse.json({ message: "No username in body" }, { status: 403 })
        }

    }
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
}