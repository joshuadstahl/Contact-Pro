import { User, userStatus } from "@/app/classes/user";
import { CreateDbConnection } from "@/app/functions/serverFunctions";
import { auth } from "@/auth";
import {Collection, Db, MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async function PUT(req: NextRequest) {
    
    let session = await auth();
    if (session) {
        const [db, client] = await CreateDbConnection();

        const userCollection: Collection = db.collection("users");

        let user = await userCollection.findOne<User>({email: session?.user?.email});

        let signUp = false;
        if (user === null) {
            await client.close();
            return NextResponse.json({ message: "Unauthorized. No account exists." }, { status: 401 })
        }

        let body = await req.json();

        if ("username" in body) {
            if (body.username != user.username) {
                let lookup = await userCollection.findOne<User>({username: body.username});
                if (lookup === null) {
                    await userCollection.updateOne({username: user.username}, {$set: {username: body.username}});
                    await client.close();
                    return NextResponse.json({ message: "Success"}, {status: 200});
                }
                else {
                    await client.close();
                    return NextResponse.json({ message: "Username already taken."}, {status: 409});
                }
            }
            await client.close();
            return NextResponse.json({ message: "Success"}, {status: 200});
        }
        else {
            await client.close();
            return NextResponse.json({ message: "No username in body" }, { status: 400 })
        }

    }
    return NextResponse.json({ message: "Not authorized" }, { status: 401 })
}