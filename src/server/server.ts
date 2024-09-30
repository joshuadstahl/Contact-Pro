import { WebSocketServer, WebSocket } from 'ws';
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
const dotenv = require('dotenv').config({ path: '.env.local' })
import { createHash, randomUUID } from 'crypto';
import {msgStatusEnum} from "../app/classes/messages";
import {ServerMessage, iRecipientStatuses} from "../app/classes/serverMessage";


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


//class to keep track of a client websocket pair.
class clientSocketPair {
	constructor(id:string, ws:WebSocket) {
		this.id = id;
		this.ws = new Array<WebSocket>(...[ws]);
	}
	public id: string;
	public ws: Array<WebSocket>;
}

//class to keep track of which users are subscribed to which users updates.
class userUpdateSub {

	constructor(username: string) {
		this.username = username;
	}

	public username: string;
	public subscribers = new Array<clientSocketPair>;
}

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
	name: string
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
        
        // if (currUserID == this.sender) {

        //     return new Message({...this, status:this.getMostRecentStatus(), sender:this.sender.export(currUser), read:true});
        // }
        // else {
        //     return new Message({...this, status:this.getMostRecentStatus(), sender:this.sender.export(currUser), read:(currUser in this.recipientStatuses ? this.recipientStatuses[currUser]['4read'] !== null && this.recipientStatuses[currUser]['4read'] !== undefined : false)});
        // }
        
    }
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

function getMostRecentStatus(msg: dbRawMessage) {
	if (Object.keys(msg.recipientStatuses).length == 1) {
		let lastValidStatus = 0;
		let userID = Object.keys(msg.recipientStatuses)[0]; //get the userID
		let userData = msg.recipientStatuses[userID]; //the data for the userID
		let userKeys2 = Object.keys(msg.recipientStatuses[userID]).sort(); //the keys for the statuses under the userID
		
		type objectKey = keyof typeof userData; //the datatype for the keys under the userID

		//loop through each of the possible keys(status items) in the array
		for (let i = 0; i < userKeys2.length; i++) {
			//if the current key in the values d
			if (userData[userKeys2[i] as objectKey] !== null) lastValidStatus = i;
			else break;
		}
		return (lastValidStatus as msgStatusEnum);
	}
	else {
		let unameList = Object.keys(msg.recipientStatuses); //get a list of recipient userIDs
		let maxStatus = new Array<Number>; //array of the max status (most recent status) for each of the userIDs

		unameList.forEach(userID => {
			let lastValidStatus = 0;
			let userData = msg.recipientStatuses[userID]; //the data for the userID
			let userKeys2 = Object.keys(msg.recipientStatuses[userID]).sort(); //the keys for the statuses under the userID
			
			type objectKey = keyof typeof userData; //the datatype for the keys under the userID

			//loop through each of the possible keys(status items) in the array
			for (let i = 0; i < userKeys2.length; i++) {
				//if the current key in the values d
				if (userData[userKeys2[i] as objectKey] !== null) lastValidStatus = i;
				else break;
			}
			maxStatus.push(lastValidStatus);
		});

		maxStatus = maxStatus.sort();

		return (maxStatus[maxStatus.length - 1] as msgStatusEnum);  
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
						if (msg.data !== undefined) {
							let _id = msg.data._id !== undefined ? msg.data._id : "";
							try {
								let newM = new incomingNewMessage({...msg.data, currUserID:currUserID});
								let verified = await newM.verify(currUserID, db);
								if (verified) {
									let newID = await newM.submit(db);
									if (newID !== false) {
										ws.send(JSON.stringify({"msgType":"messageCreated", data: {newid: newID, oldid: newM._id}}));
										ws.send(JSON.stringify({"msgType":"messageUpdate", data: {_id: newID, status:2}})); //communicate that the message has been received (status changed)
									}
									else {
										ws.send(JSON.stringify({"msgType":"messageCreationFailed", data: {_id: newM._id}}));
									}

									newM.chat?.members.forEach(client => {
										//if the current client(member) is online, send the new message to the client
										if (client in clients) {
											clients[client].forEach(clientWS => {
												
												let out = {
													msgType: "message",
													data: {
														_id: newID,
														chatID: newM.chatID,
														message: newM.message,
														messageData: newM.messageData,
														messageType: newM.messageType,
														sender: newM.sender,
														timestamp: newM.timestamp,
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
								else {
									ws.send(JSON.stringify({"msgType":"messageCreationFailed", data: {_id: newM._id}}));
								}
							} 
							catch (err) {
								ws.send(JSON.stringify({"msgType":"messageCreationFailed", data: {_id: _id}}));
							}
						}
						break;
					case "messageUpdate":
						if (msg.data != undefined && msg.data._id != undefined) {
							console.log("not null 1");
							try {
								let updates = false;

								let msgID : string = msg.data._id.toString();
								console.log(msgID);
								const msgCollection = db.collection<dbRawMessage>("messages_raw");
								let msgdata = await msgCollection.findOne({_id: new ObjectId(msgID)});

								if (msgdata != null) {
									console.log("not null 2");
									if (msg.data.received != undefined) {
										if (msg.data.received == true) {
											if (msgdata.recipientStatuses != undefined && currUserID in msgdata.recipientStatuses) {
												//if the message for the current user is not delivered, set it to delivered.
												if (msgdata.recipientStatuses[currUserID]['3delivered'] == null) {
													msgdata.recipientStatuses[currUserID]['3delivered'] = new Date().toString();
													updates = true;
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
										sendMessageToUserIfConnected(msgdata.sender.toString(), JSON.stringify({msgType: "messageUpdate", data: {_id: msgID, status:getMostRecentStatus(msgdata)}}));
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
		
		
		// console.log('received: %s', data);
	});

	//ws.send('something');

	// console.log(wss.clients.size);
	// console.log(wss.clients);



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
				//tell all the other subs that the user is offline
				await statusUpdate(0); //0 is offline
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