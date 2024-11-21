import { WebSocketServer, WebSocket } from 'ws';
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
const dotenv = require('dotenv').config({ path: '.env.local' })
import { createHash, randomUUID } from 'crypto';
import {msgStatusEnum} from "../app/classes/messages";
import {ServerMessage, iRecipientStatuses} from "@/app/classes/serverMessage";
import { getMostRecentStatus } from '@/app/components/util/functions';


const wss = new WebSocketServer({
	port: 8080,
	perMessageDeflate: {
		// Other options settable:
		clientNoContextTakeover: true, // Defaults to negotiated value.
		serverNoContextTakeover: true, // Defaults to negotiated value.
		serverMaxWindowBits: 10, // Defaults to negotiated value.
		// Below options specified as default values.
		concurrencyLimit: 10, // Limits zlib concurrency for perf.
		threshold: 1024 // Size (in bytes) below which messages
		// should not be compressed if context takeover is disabled.
	},
	clientTracking: true
});

interface wsLogin {
	hash: string;
	userID: string;
	exp: Date|string;
	rand: number;
}

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

class outgoingNewMessage {

	constructor({_id, chatID, message, messageData, messageType, currUser, timestamp} : {_id:string, chatID:string, message:string, messageData:string, messageType: number, currUser: string, timestamp: string}) {
		this._id = _id;
		this.chatID = chatID;
		this.message = message;
		this.messageData = messageData;
		this.messageType = messageType;
		this.sender = currUser;
		this.timestamp = timestamp;
		this.status = 0;
	}

	public _id: string;
	public chatID: string;
	public sender: string;
	public message: string;
	public messageData: string;
	public messageType: number;
	public timestamp: string;
	public status: number;

	public export(currUserID: string) {

		if (currUserID == this.sender) {
			return {
				...this,
				status: 0
			}
		}
		else {
			return {

			}
		}
        
    }
}


let clients: { [username:string]: Array<WebSocket> } = {};
let userSubs: { [username:string]: Array<string> } = {};

wss.on('connection', async function connection(ws: WebSocket, request) {

	let lastSlash = request.url?.lastIndexOf("/") ?? 0;
	let userkey = request.url?.substring(lastSlash + 1);

	const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING ?? "");
	await client.connect();
	const db: Db = client.db(process.env.DB_NAME ?? "");

	const wsAuthCollection: Collection<wsLogin> = db.collection<wsLogin>("ws_auth");

	let auth = await wsAuthCollection.findOne({hash: userkey});
	
	let currUserID = ""; //the current user ID for the client signed in.

	//auth = auth as wsLogin;
	if (auth !== null) {

		//normalize localhost addresses
		let ip = request.socket.remoteAddress;
		if (ip == "::ffff:127.0.0.1" || ip == "::1") {
			ip = "localhost";
		}
		let newHash = createHash('sha256').update(auth.exp.toString() + ip + auth.userID + auth.rand).digest("hex").toString();

		if (auth.hash != newHash) {
			handleClose("Unauthorized", 1000);
		}
		else {
			currUserID = auth.userID;
			await wsAuthCollection.deleteOne({hash: userkey});
			if (!(currUserID in clients)) {
				clients[currUserID] = [ws]
			}
			else {
				clients[currUserID].push(ws);
			}
			
			console.log("Welcome aboard, %s", currUserID);
			ws.send(JSON.stringify({message: "initialized"})); 
		}
	}
	else {
		handleClose("Unauthorized", 1000);
	}
	

	function handleClose(message:string, code:number) {
		let msg = {message: "Unauthorized"};
		ws.send(JSON.stringify(msg));
		ws.close(1000, "Unauthorized");
	}

	function propagateToSubs(update: string) {
		if (currUserID in userSubs) {
			userSubs[currUserID].forEach((user) => {
				if (user in clients) {
					clients[user].forEach((ws) => {
						ws.send(update);
					})
				}
			})

		}

		if (currUserID in clients) { //make sure the username is in the clients list
			//if there is more than one client for the current currUserID,
			//then propagate to the other clients with the same username
			if (clients[currUserID].length > 1) {
				for (let i = 0; i < clients[currUserID].length; i++) {
					if (clients[currUserID][i] !== ws) {
						clients[currUserID][i].send(update);
					}
				}
			}
		}
	}

	function sendMessageToUserIfConnected(userID: string, msg: string) {
		if (userID in clients) {
			console.log("sending!");
			clients[userID].forEach((ws) => {
				ws.send(msg.toString());
			})
		}
	}

	async function statusUpdate(status: number, both=false) {
		let out = {
			msgType: "userUpdate",
			data: {
				updateType: "status",
				status: status,
				userID: currUserID
			}
		}
		const userCollection = db.collection('users');
		let set = both ? {$set: {status: status, savedStatus: status}} : {$set: {status: status}};
		await userCollection.updateOne({_id: new ObjectId(currUserID)}, set);
		propagateToSubs(JSON.stringify(out));
	}
	

	ws.on('error', async () => {
		await client.close();
		console.error();
		
	}
	);

	ws.on('message', async function message(data) {

		try {
			let msg;
			
			try {
				msg = JSON.parse(data.toString());
			}
			catch (err) {
				console.log("Error: ", err);
				handleClose("Unknown error occurred", 1011);
				return;
			}

			console.log(msg);
	
			//if the user is logged in
			if (currUserID != "") {
			
				let mType = msg.msgType;
				switch (mType) {
					case "userUpdate":
						try {
							let type = msg.data.updateType.toString().toLowerCase();
							if (type == "status") {
								if (msg.data.status !== undefined && typeof msg.data.status == "number") {
									let newStatus = msg.data.status;
									if (newStatus >= 0 && newStatus <= 2) {
										statusUpdate(newStatus, true);
									}
								}
							}
							else if (type == "name") {

							}
							else if (type == "username") {

							}
							else if (type == "photo") {

							}
						}
						catch (err) {

						}
						
						break;
					case "message":
						//only allow this type of message from the HTTP API
						if (msg.data !== undefined && currUserID == "HTTPAPI-CLIENT") {

							let members = msg.data.members;

							members.forEach((client: string) => {
								//if the current client(member) is online, send the new message to the client
								if (client in clients) {
									clients[client].forEach(clientWS => {
										
										let out = {
											msgType: "message",
											data: {
												...msg.data,
												read: false,
												received: false,
												status: 0
											}
										}

										//if the client is the same as the current user ID,
										//make sure you send different information (e.g read=true)
										if (client == currUserID) {
											//if the client WS is not the same as the current websocket
											if (clientWS != ws) {
												out.data.read = true;
												out.data.received = true;
												out.data.status = 0;
												clientWS.send(JSON.stringify(out));
											}
										}
										else {
											//if the client WS is not the same as the current websocket
											if (clientWS != ws) {
												clientWS.send(JSON.stringify(out));
											}
										}
										
									})
								}
							});
						}
						break;
					case "newChat":
						//received when a new chat is created

						if (msg.data !== undefined) {
							let _id = msg.data._id !== undefined ? msg.data._id : "";
							try {

								const chatCollection = db.collection<dbRawChat>("chats_raw");
								const chat = await chatCollection.findOne<dbRawChat>({_id: new ObjectId(String(_id.toString()))})

								if (chat !== null) {
									
									//if the owner (creator) of the chat is not equal to current user's chat, then
									//the user is not authorized.
									if (chat.owner.toString() != currUserID) {
										ws.send(JSON.stringify({"msgType":"Not authorized for this action.", data: {_id: _id}}));
									}

									//if the user has already sent this message for this chat, return an error,
									//because I don't want DOS attacks on my users.
									if (chat.chatCreationNotified == true) {
										ws.send(JSON.stringify({"msgType":"Action previously performed for this chat", data: {_id: _id}}));
									}

									let out = {
										msgType: "newChat",
										data: {
											_id: chat._id.toString()
										}
									}

									chat.members.forEach(client => {
										//if the current client(member) is online, send the new message to the client
										if (client in clients) {
											clients[client].forEach(clientWS => {
												
												//if the client WS is not the same as the current websocket,
												//send it a message about the new chat
												if (clientWS != ws) {
													clientWS.send(JSON.stringify(out));
												}
											})
										}
									});

								
									//update the database for the chat
									let res = await chatCollection.updateOne({_id: new ObjectId(String(_id.toString()))}, {$set: {chatCreationNotified: true}});
									if (res.modifiedCount == 0) {
										console.log("didn't update database after new chat notification");
									}

								}								

							} 
							catch (err) {
								console.log(err);
								ws.send(JSON.stringify({"msgType":"newChatNotifyFailed", data: {_id: _id}}));
							}
						}
						break;
					case "messageUpdate":
						if (msg.data != undefined && msg.data._id != undefined) {
							try {
								let updates = false;

								let msgID : string = msg.data._id.toString();
								const msgCollection = db.collection<dbRawMessage>("messages_raw");
								let msgdata = await msgCollection.findOne({_id: new ObjectId(msgID)});

								if (msgdata != null) {
									if (msg.data.received !== undefined) {
										if (msg.data.received == true) {
											//make sure that the recipientStatuses field is defined.
											if (msgdata.recipientStatuses !== undefined) {
												if (currUserID in msgdata.recipientStatuses) {
													//if the message for the current user is not delivered, set it to delivered.
													if (msgdata.recipientStatuses[currUserID]['3delivered'] == null) {
														msgdata.recipientStatuses[currUserID]['3delivered'] = new Date().toString();
														updates = true;
													}
												}
												else {
													//we'll see if the user is a part of the chat or not.
													//If so, we'll add them to the message recipient statuses
													const chatsCollection = db.collection<dbRawChat>("chats_raw");
													let chat = await chatsCollection.findOne({_id: new ObjectId(msgdata.chatID ?? "")});

													//if the chat exists, proceed
													if (chat !== null) {
														//loop through the chat members to see if the current user ID is equal to any of them
														for (let i = 0; i < chat.members.length; i++) {
															if (currUserID == chat.members[i].toString()) {
																msgdata.recipientStatuses[currUserID] = {
																	"0queued": msgdata.timestamp.toString(),
																	"1sending": msgdata.timestamp.toString(),
																	"2sent": msgdata.timestamp.toString(),
																	"3delivered": new Date().toString(),
																	"4read": null
																}
																updates = true;
																break;
															}
														}
													}
												}
											}
										}
									}
									
									if (msg.data.read != undefined) {
										if (msg.data.read == true) {
											if (msgdata.recipientStatuses != undefined && currUserID in msgdata.recipientStatuses) {
												//if the message for the current user is not read, set it to read.
												if (msgdata.recipientStatuses[currUserID]['4read'] == null) {
													//if for some reason it is not shown as delivered, set it to be delivered.
													if (msgdata.recipientStatuses[currUserID]['3delivered'] == null) {
														msgdata.recipientStatuses[currUserID]['3delivered'] = new Date().toString();
													}
													msgdata.recipientStatuses[currUserID]['4read'] = new Date().toString(); //set the message for the user to be read.
													
													updates = true;
												}
											}
										}
									}
	
									if (updates) {
										console.log("updates to raw message!");
										await msgCollection.updateOne({_id: new ObjectId(msgID)}, {$set: {recipientStatuses: msgdata.recipientStatuses}});
										sendMessageToUserIfConnected(msgdata.sender.toString(), JSON.stringify({msgType: "messageUpdate", data: {_id: msgID, status:getMostRecentStatus(msgdata.recipientStatuses)}}));
									}	
								}
												
							}
							catch (err) {
								console.log(err);
								console.log("failed to update message status");
							}

							console.log("messageUpdate");

						}
						break;
					case "userUpdateSubscribe":
						let subID = msg.data.userSubID;

						if (subID in userSubs) {
							if (userSubs[subID].indexOf(currUserID) == -1) {
								userSubs[subID].push(currUserID);
							}
						}
						else {
							userSubs[subID] = [currUserID];
						}

						console.log(userSubs);
						break;
					case "broadcast":
						let relayMsg = msg.data.message;
						//clients.
						Object.keys(clients).forEach((client) => {
							if (client != currUserID) {
								clients[client].forEach((ws) => ws.send(relayMsg))
							}
						})
						console.log("Broadcasting the message: %s", relayMsg);
						break;
					case "clientCnt":
						ws.send(Object.keys(clients).length);
						break;
				}
	
			}
			else {
				handleClose("Unauthorized", 1000);
			}
		}
		catch (err) {
			handleClose("Unknown error occurred", 1011);
		}
		
	});

	ws.on('close', async (x, reason) => {
		
		
		if (currUserID in clients) {
			//if there is just one (or no) client for a user, delete everything related with that username
			if (clients[currUserID].length <= 1) {
				delete clients[currUserID];
				Object.keys(userSubs).forEach((userSub) => {
					if (userSubs[userSub].indexOf(currUserID) != -1) {
						userSubs[userSub].splice(userSubs[userSub].indexOf(currUserID), 1);
					}
				})
				//tell all the other subs that the user is offline, as long as 
				//the current user isn't the api
				if (currUserID != "HTTPAPI-CLIENT") {
					await statusUpdate(0); //0 is offline
				}
			}
			//if there are more than one client for a username, only remove the websocket for the current connection
			else {
				for (let i = 0; i < clients[currUserID].length; i++) {
					if (ws == clients[currUserID][i]) {
						clients[currUserID].splice(i, 1);
					}
				}
			}
		}
		await client.close();
		if (reason.toString() == "") {
			console.log("Connection closed. %s logged off.", currUserID);
		}
		else {
			console.log("Connection closed. " + reason.toString());
		}

	})
});