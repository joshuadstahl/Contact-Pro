import { auth } from "@/auth";
import {Collection, Db, MongoClient} from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ServerUser } from "@/app/classes/serverUser";
import { CreateDbConnection, GetOrCreateWSAuthToken } from "@/app/functions/serverFunctions";

export const GET = async function GET(req: NextRequest) {
    let session = await auth();
    if (session) {
        const [db, client]: [Db, MongoClient] = await CreateDbConnection();

        const userCollection: Collection = db.collection("users");

        let user = await userCollection.findOne<ServerUser>({email: session?.user?.email});

        if (user === null) {
            await client.close();
            return NextResponse.json({ message: "Unauthorized. No account exists." }, { status: 401 })
        }

        let authHash = await GetOrCreateWSAuthToken(db, user._id.toString(), req.headers.get("x-forwarded-for"));

        let out = {
            hash: authHash,
            addr: process.env.WS_CONNECT_ADDR
        }

        await client.close();

        return NextResponse.json(out);
    }
    return NextResponse.json({ message: "Not authorized" }, { status: 401 })
}
