import { auth } from "@/auth";
import {Collection, Db, MongoClient} from "mongodb";
import { NextResponse } from "next/server";
import { ServerUser } from "@/app/classes/serverUser";
import { CreateDbConnection, GetOrCreateWSAuthToken } from "@/app/components/util/serverFunctions";

export const GET = auth(async function GET(req) {
    if (req.auth) {
        let session = req.auth;
        const [db, client]: [Db, MongoClient] = await CreateDbConnection();

        const userCollection: Collection = db.collection("users");

        let user = await userCollection.findOne<ServerUser>({email: session?.user?.email});

        if (user === null) {
            return NextResponse.json({ message: "No account" }, { status: 403 })
        }

        let authHash = await GetOrCreateWSAuthToken(db, user._id.toString(), req.headers.get("x-forwarded-for"));

        let out = {
            hash: authHash,
            addr: process.env.WS_CONNECT_ADDR
        }

        client.close();

        return NextResponse.json(out);
    }
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
})
