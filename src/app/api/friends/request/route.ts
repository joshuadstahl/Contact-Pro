import { auth } from "@/auth";
import {Collection, Db, MongoClient, ObjectId, PushOperator, Timestamp } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ServerUser } from "@/app/classes/serverUser";
import { RawServerFriendRequest } from "@/app/classes/serverFriendRequests";
import { sendWSMessage } from "@/app/functions/serverFunctions";

export const POST = async function POST(req: NextRequest) {
    try {
        let session = await auth();
        if (session) {
            let body =  await req.json();
            if (body !== undefined) {
                const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING ?? "");
                await client.connect();
                const db: Db = client.db(process.env.DB_NAME ?? "");

                const userCollection: Collection = db.collection("users");

                let user = await userCollection.findOne<ServerUser>({email: session?.user?.email});

                if (user === null) {
                    console.log("no user!");
                    client.close();
                    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
                }
                else {

                    //make sure a user id was included in the body.
                    if (body.id === undefined || body.id == "") {
                        client.close();
                        return NextResponse.json({ message: "No user id received." }, { status: 400 });
                    }

                    //make sure user is not already a friend.
                    let targetID = new ObjectId(String(body.id));
                    for (let i = 0; i < user.friends.length; i++) {
                        if (targetID.equals(user.friends[i])) {
                            client.close();
                            return NextResponse.json({ message: "User is already a friend." }, { status: 400 });
                        }
                    }

                    //make sure the submitted userID exists.
                    let userCheck = await userCollection.findOne<ServerUser>({_id: new ObjectId(String(body.id))});
                    if (userCheck === null) {
                        client.close();
                        return NextResponse.json({ message: "User does not exist." }, { status: 400 });
                    }

                    const friendRequestsCollection : Collection = db.collection("friendRequests_raw");

                    //make sure there is no other friend request between the two users already active.
                    let duplicate = await friendRequestsCollection.findOne({$or: [
                        {sender: new ObjectId(user._id.toString()), recipient: new ObjectId(String(body.id.toString()))}, 
                        {recipient: new ObjectId(user._id.toString()), sender: new ObjectId(String(body.id.toString()))}
                    ]});

                    //if there is success, then there is a friends request that already exists.
                    if (duplicate !== null) {
                        client.close();
                        return NextResponse.json({ message: "Similar friend request already exists." }, { status: 400 });
                    }

                    //create friend request.
                    let res = await friendRequestsCollection.insertOne({sender: new ObjectId(user._id.toString()), timestamp: new Date(), recipient: new ObjectId(String(body.id.toString()))})

                    client.close();

                    if (res.acknowledged) {
                        //notify websocket server of updates
                        await sendWSMessage({msgType: "friendRequest", data:{
                            action: "create",
                            id: res.insertedId,
                            recipient: body.id,
                            sender: user._id.toString(),
                            timestamp: new Date()
                        }})

                        return NextResponse.json({msg: "Friend request successfully created.", data: {id: res.insertedId}}, {status: 201});
                    }
                    else {
                        return NextResponse.json({msg: "Unable to create friend request"}, {status: 500});
                    }
                    
                }
            }
            else {
                return NextResponse.json({ message: "No body received." }, { status: 400 });
            }
            
        }
        
    } catch (err) {
        return NextResponse.json({ message: "Unable to create friend request.", err:{err}}, { status: 500 });
    }
    
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
}

export const PATCH = async function PATCH(req: NextRequest) {
    try {
        let session = await auth();
        if (session) {
            let body =  await req.json();
            if (body !== undefined) {
                const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING ?? "");
                await client.connect();
                const db: Db = client.db(process.env.DB_NAME ?? "");

                const userCollection: Collection = db.collection("users");

                let user = await userCollection.findOne<ServerUser>({email: session?.user?.email});

                if (user === null) {
                    console.log("no user!");
                    client.close();
                    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
                }
                else {
                    //make sure a friend request id was included in the body.
                    if (body.id === undefined || body.id == "") {
                        client.close();
                        return NextResponse.json({ message: "No friend request id received." }, { status: 400 });
                    }

                    //make sure an action was included in the body.
                    if (body.action === undefined || body.action == "") {
                        client.close();
                        return NextResponse.json({ message: "No action received." }, { status: 400 });
                    }

                    //make sure action is one of the predefined values.
                    let action = body.action.toString().toLowerCase();
                    if (action != "accept" && action != "reject" && action != "cancel") {
                        client.close();
                        return NextResponse.json({ message: "Invalid action." }, { status: 400 });
                    }

                    //Get friend request.
                    const friendRequestsCollection : Collection = db.collection("friendRequests_raw");
                    let friendRequest = await friendRequestsCollection.findOne<RawServerFriendRequest>({_id: new ObjectId(String(body.id.toString()))});

                    //if the friend request id does not exist, throw error.
                    if (friendRequest === null) {
                        client.close();
                        return NextResponse.json({ message: "Invalid friend request id." }, { status: 400 });
                    }

                    //make sure user is not already a friend.
                    let targetID = new ObjectId(friendRequest.sender.toString() == user._id.toString() ? friendRequest.recipient.toString() : friendRequest.sender.toString()); //the user id of the other user in the friend request.
                    for (let i = 0; i < user.friends.length; i++) {
                        if (targetID.equals(user.friends[i])) {
                            client.close();
                            return NextResponse.json({ message: "User is already a friend." }, { status: 400 });
                        }
                    }

                    let newID = "";
                    //make sure the accessing user is allowed to perform the specific action requested, and then perform the actions.
                    if (action == "accept" || action == "reject") {

                        //check permissions
                        if (friendRequest.recipient.toString() != user._id.toString()) {
                            client.close();
                            return NextResponse.json({ message: "Unauthorized to perform this action on this friend request." }, { status: 403 });
                        }
                   
                        
                        if (action == "accept") {

                            //create the group in the database and return the information
                            let chatMembers = [
                                new ObjectId(friendRequest.recipient.toString()),
                                new ObjectId(friendRequest.sender.toString())
                            ]
                            const chatsRawCollection: Collection = db.collection("chats_raw");
                            let res = await chatsRawCollection.insertOne({chatType: "user", members: chatMembers, photo: "", name: '', owner: new ObjectId(user._id.toString()), chatCreationNotified: false, timestamp: new Date()})

                            if (res.acknowledged) {
                                newID = res.insertedId.toString();
                                //notify websocket server of updates
                                await sendWSMessage({msgType: "friendRequest", data:{
                                    action: "accept",
                                    id: body.id.toString(),
                                    newChatID: res.insertedId,
                                    recipient: friendRequest.recipient,
                                    sender: friendRequest.sender,
                                    timestamp: friendRequest.timestamp
                                }})
                            }
                            else {

                            }

                            //add friends to the two users involved (recipient and sender)
                            let updateOne = await userCollection.updateOne({_id: new ObjectId(friendRequest.sender.toString())}, {$push: {"friends": new ObjectId(friendRequest.recipient.toString())} as PushOperator<Document>});
                            updateOne = await userCollection.updateOne({_id: new ObjectId(friendRequest.recipient.toString())}, {$push: {"friends": new ObjectId(friendRequest.sender.toString())} as PushOperator<Document>});
                            
                        }
                        else {
                            //notify websocket server of updates
                            await sendWSMessage({msgType: "friendRequest", data:{
                                action: "reject",
                                id: body.id.toString(),
                                recipient: friendRequest.recipient,
                                sender: friendRequest.sender,
                                timestamp: friendRequest.timestamp
                            }})
                        }

                        //delete the friend request in the database
                        let res = await friendRequestsCollection.deleteOne({_id: new ObjectId(String(body.id.toString()))}); //delete the request in the database.
                        
                    }
                    else {
                        //check permissions
                        if (friendRequest.sender.toString() != user._id.toString()) {
                            client.close();
                            return NextResponse.json({ message: "Unauthorized to perform this action on this friend request." }, { status: 403 });
                        }

                        //notify websocket server of updates
                        await sendWSMessage({msgType: "friendRequest", data:{
                            action: action,
                            id: body.id.toString(),
                            recipient: friendRequest.recipient,
                            sender: friendRequest.sender,
                            timestamp: friendRequest.timestamp
                        }})

                        //delete the friend request in the database
                        let res = await friendRequestsCollection.deleteOne({_id: new ObjectId(String(body.id.toString()))}); //delete the request in the database.
                    }

                    client.close();

                    if (newID != "") {
                        return NextResponse.json({msg: "Successfully accepted friend request.", data: {newChatID: newID} }, {status: 201});
                    }
                    else {
                        return NextResponse.json({msg: "Successfully " + action + "ed friend request."}, {status: 200});
                    }

                }
            }
            else {
                return NextResponse.json({ message: "No body received." }, { status: 400 });
            }
            
        }
        
    } catch (err) {
        console.log(err);
        return NextResponse.json({ message: "Unable to create friend request.", err:{err}}, { status: 500 });
    }
    
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
}