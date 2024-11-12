import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth";
import { Db, Collection, ObjectId } from "mongodb";
import { ServerUser } from "@/app/classes/serverUser";
import { CreateDbConnection, sendWSMessage } from "@/app/components/util/serverFunctions";
import { iRecipientStatuses } from "@/app/classes/serverMessage";

interface dbRawChat {
	_id: ObjectId
	chatType: string,
	members: Array<string>,
	photo: string,
	name: string,
	owner: ObjectId,
	chatCreationNotified: boolean,
	timestamp: Date
}

interface dbRawMessage {
	_id?: ObjectId;
	chatID: ObjectId;
	sender: ObjectId;
	message: string;
	messageData: string;
	messageType: number;
	timestamp: Date;
	recipientStatuses: iRecipientStatuses;
}

class incomingNewMessage {
	constructor({_id, chatID, message, messageData, messageType, currUserID} : {_id:string, chatID:string, message:string, messageData:string, messageType: number, currUserID: string}) {
		this._id = _id;
		this.chatID = chatID;
		this.message = message;
		this.messageData = messageData;
		this.messageType = messageType;
		this.sender = currUserID;
	}

	public _id: string;
	public chatID: string;
	public message: string;
	public messageData: string;
	public messageType: number;
	public sender: string;
	public timestamp: string = new Date().toString();
	public chat?: dbRawChat;
	public recipientStatuses: {
		[username: string]: {
			"0queued": string | null;
			"1sending": string | null;
			"2sent": string | null;
			"3delivered": string | null;
			"4read": string | null;
		}
	} = {};

	public async verify(currUserID: string, db:Db) {
		//verify the chat ID and that the current user is a part of that chat
		const chatCollection = db.collection<dbRawChat>("chats_raw");
		const chat = await chatCollection.findOne<dbRawChat>({_id: new ObjectId(this.chatID)})

		if (chat !== null) {

			//convert members list from objectIDs to strings
			let stringMembers = chat.members.map((mbr) => {
				return mbr.toString();
			})
			//if the current user is a part of this chat, verification complete!
			if (stringMembers.indexOf(currUserID) != -1) {
				this.chat = chat;
				return true;
			}
			else { //user is not a member of the chat, so return false.
				return false;
			}
		}
		else {
			return false; //no document returned, so return false
		}
	}

	public async submit(db: Db) {

		//as long as the chat is not undefined (verification not done or failed)
		if (this.chat !== undefined) {
			this.chat.members.forEach((mbr) => {
				this.recipientStatuses[mbr] = {
					"0queued": this.timestamp.toString(),
					"1sending": this.timestamp.toString(),
					"2sent": this.timestamp.toString(),
					"3delivered": null,
					"4read": null
				}
			})
			const msgCollection = db.collection<dbRawMessage>("messages_raw");
			const res = await msgCollection.insertOne(
				{
					_id: undefined,
					chatID: new ObjectId(this.chatID),
					sender: new ObjectId(this.sender),
					message: this.message,
					messageData: this.messageData,
					messageType: this.messageType,
					timestamp: new Date(this.timestamp),
					recipientStatuses: this.recipientStatuses
				}
			);

			if (res.acknowledged) {
				return res.insertedId; //return the id of the inserted document
			}
			else {
				return false; //failed somehow, so return false
			}
		}
		else {
			return false; //no verification, so return false
		}
	}
}

export const POST = async function(req: Request) {

    try {
        let session = await auth();
        if (session) {
            let body =  await req.json();
            if (body !== undefined) {
                const [db, client] = await CreateDbConnection();

                const userCollection: Collection = db.collection("users");

                let user = await userCollection.findOne<ServerUser>({email: session?.user?.email});

                if (user !== null) {
                    let _id = body._id !== undefined ? body._id : "";
                    let currUserID = user._id.toString();
                    try {
                        let newM = new incomingNewMessage({...body, currUserID:currUserID});
                        let verified = await newM.verify(currUserID, db);
                        if (verified) {
                            let newID = await newM.submit(db);
							client.close();
                            if (newID !== false) {
                                let res = await sendWSMessage({msgType: "message", data: {
									_id: newID,
									oldID: _id,
									chatID: newM.chatID,
									message: newM.message,
									messageData: newM.messageData,
									messageType: newM.messageType,
									sender: newM.sender,
									timestamp: newM.timestamp,
									members: newM.chat?.members ?? []
								}});

								return NextResponse.json({ message: "Successfully created message.", data: {_id: newID}}, { status: 201 });
                            }
                            else {
                                return NextResponse.json({ message: "Unable to create message."}, { status: 500 });
                            }

                        }
                        else {
                            return NextResponse.json({ message: "Incorrect fields provided in the body or fields missing."}, { status: 400 });
                        }
                    }
                    catch (err) {
                        return NextResponse.json({ message: "Unable to create message.", err:{err}}, { status: 500 });
                    }
                }
                else {
                    return NextResponse.json({ message: "Unable to retrieve current user."}, { status: 500 });
                }

            }
        }
    } catch (err) {
        console.log(err);
        return NextResponse.json({ message: "Unable to create message.", err:{err}}, { status: 500 });
    }

    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
}