import { User, userStatus } from "@/app/classes/user";
import { auth } from "@/auth";
import {Collection, Db, MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { ServerUser } from "@/app/classes/serverUser";
import { createHash, randomInt } from "crypto";


interface wsLogin {
    hash: string;
    userID: string;
    exp: Date|string;
    rand: number;
}

export const GET = auth(async function GET(req) {
    if (req.auth) {
        let session = req.auth;
        const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING ?? "");
        await client.connect();
        const db: Db = client.db(process.env.DB_NAME ?? "");

        const userCollection: Collection = db.collection("users");

        let user = await userCollection.findOne<ServerUser>({email: session?.user?.email});

        if (user === null) {
            return NextResponse.json({ message: "No account" }, { status: 403 })
        }

        const wsAuthCollection: Collection = db.collection("ws_auth");

        let currAuth = await wsAuthCollection.findOne<wsLogin>({_id: new ObjectId(user._id)});

        let newAuth : wsLogin;
        if (currAuth !== null) {
            newAuth = currAuth;
        }
        else {
            //create a new wsLogin object to insert into the database
            newAuth = {
                hash: "",
                userID: user._id.toString(),
                exp: new Date(new Date().getTime() + 60000 * 5),
                rand: randomInt(1, 60000)
            }
            let ip = req.headers.get("x-forwarded-for") ?? "invalid";
            if (ip == "::ffff:127.0.0.1" || ip == "::1") {
                ip = "localhost";
            }
            newAuth.hash = createHash('sha256').update(newAuth.exp.toString() + ip + newAuth.userID + newAuth.rand).digest("hex").toString();
            await wsAuthCollection.insertOne(newAuth);
        }

        let out = {
            hash: newAuth.hash,
            addr: process.env.WS_CONNECT_ADDR
        };
        

        client.close();

        return NextResponse.json(out);
    }
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
})
