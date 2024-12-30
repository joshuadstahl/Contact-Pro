import { auth } from "@/auth";
import { MongoClient, Collection, Db, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/app/classes/user";
import { ServerUser } from "@/app/classes/serverUser";
import { CreateDbConnection } from "@/app/functions/serverFunctions";


//this sends out the chats for a user
export const GET = async function GET(req: Request, props: { params: Promise<{ _id: string }> }) {
    const params = await props.params;

    //make sure there is a valid session
    let session = await auth();
    if (session) {
        const [db, client] = await CreateDbConnection();

        const userCollection: Collection = db.collection("users");

        let user = await userCollection.findOne<User>({email: session?.user?.email});

        let outUser = new Object;

        if (user === null) {
            await client.close();
            return NextResponse.json({ message: "Unauthorized. No account exists." }, { status: 401 })
        }

        //const userCollection: Collection<ServerChat> = db.collection<ServerChat>("users");
        let fetchedUser = await userCollection.findOne<ServerUser>({_id: new ObjectId(params._id ?? "")});

        if (fetchedUser !== null) {
            outUser = new ServerUser(fetchedUser).export(user._id);
        }
        else {
            await client.close();
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        await client.close();

        return NextResponse.json(outUser, {status: 200});
    }
    return NextResponse.json({ message: "Not authorized" }, { status: 401 })
}