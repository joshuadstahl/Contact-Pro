import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth";
import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import { ServerUser } from "@/app/classes/serverUser";
import { ServerChat } from "@/app/classes/serverChats";
import { randomUsername } from "@/app/functions/functions";

export const POST = async function(req: Request) {

    try {
        let session = await auth();
        if (session) {
            let body =  await req.json();
            if (body !== undefined) {
                if (body.members !== undefined && body.members.length != 0) {
                    const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING ?? "");
                    await client.connect();
                    const db: Db = client.db(process.env.DB_NAME ?? "");

                    const userCollection: Collection = db.collection("users");

                    let user = await userCollection.findOne<ServerUser>({email: session?.user?.email});

                    //get the friends of the current user
                    let friends : Array<ObjectId> = [];
                    if (user !== null && user.friends !== undefined) {
                        friends = user.friends;
                    }
                    else {
                        await client.close();
                        return NextResponse.json({ message: "Failed to fetch user." }, { status: 500 });
                    }

                    //the members of the chat should be the user's friends, so if the 
                    //number of the users' friends is zero, return an error.
                    if (friends.length == 0) {
                        await client.close();
                        return NextResponse.json({ message: "Can't create chat with members that are not friends." }, { status: 400 });
                    }

                    //make sure the new members of the chat are friends of the creating user
                    for (let i = 0; i < body.members.length; i++) {
                        let member = body.members[i];
                        if (!friends.find((str) => str == member)) {
                            await client.close();
                            return NextResponse.json({ message: "Can't create chat with members that are not friends." }, { status: 400 });
                        }
                    }

                    //if we've reached this point, figure out the name of the group
                    let chatName = "";
                    //if the user defined a name for the group
                    if (body.name !== undefined && body.name != "") {
                        chatName = body.name;
                    }
                    //user didn't define a name, so randomly create one (using the random username function)
                    else {
                        chatName = randomUsername() + " Chat";
                    }

                    let chatType = 'group'; //the chat type can only be group, user chats are made only via accepting a friend request.
                    
                    //add the current user to the chat too
                    body.members.push(user._id.toString());
                    
                    console.log(body.members)

                    //convert the members list to a list of ObjectIDs
                    let convMembers = body.members.map((mbr: string ) => {
                        return new ObjectId(mbr);
                    })
                    
                    //create the group in the database and return the information
                    const chatsRawCollection: Collection = db.collection("chats_raw");
                    let res = await chatsRawCollection.insertOne({chatType: chatType, members: convMembers, photo: "", name: chatName, owner: new ObjectId(user._id.toString()), chatCreationNotified: false, timestamp: new Date()})
                    
                    let out = {
                        chatID: res.insertedId,
                        name: chatName
                    }

                    await client.close();
                    return NextResponse.json(out, { status: 200 });

                }
                else {
                    return NextResponse.json({ message: "Chat member list is empty." }, { status: 400 })
                }
            }
        }
    } catch (err) {
        console.log(err);
        return NextResponse.json({ message: "Unable to create chat.", err:{err}}, { status: 500 });
    }
    
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
}

export const GET = async function(req: NextRequest) {
    
    try {
        let session = await auth();
        if (session) {
            let id = req.nextUrl.searchParams.get("id") ?? ""; //get the id parameter from the query string

            if (!id || id == "") {
                return NextResponse.json({ message: "Can't find chat without the id." }, { status: 400 });
            }  
            
            console.log(id);
            

            const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING ?? "");
            await client.connect();
            const db: Db = client.db(process.env.DB_NAME ?? "");

            const userCollection: Collection = db.collection("users");

            let user = await userCollection.findOne<ServerUser>({email: session?.user?.email});

            if (user === null) {
                await client.close();
                return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
            }

            const chatDb: Db = client.db(process.env.DB_NAME ?? "");

            const chatCollection: Collection<ServerChat> = chatDb.collection<ServerChat>("chats");
            let chat = await chatCollection.findOne<ServerChat>({_id: new ObjectId(id)});

            if (chat === null) {
                console.log(chat);
                await client.close();
                return NextResponse.json({ message: "Chat does not exist" }, { status: 404 });
            }

            //make sure the current user is a member in the group
            if (!chat.members.find((mbr) => mbr._id.toString() == user._id.toString())) {
                await client.close();
                return NextResponse.json({ message: "You're not a member of the chat" }, { status: 400 });
            }

            let temp = new ServerChat({...chat, accessingUser: user._id.toString()});
            let out = temp.export(user._id.toString());

            await client.close();
            return NextResponse.json(out, { status: 200 });
        }
    } catch (err) {
        console.log(err);
        return NextResponse.json({ message: "Unable to get chat.", err:{err}}, { status: 500 });
    }
    
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
}