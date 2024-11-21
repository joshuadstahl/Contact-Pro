import { ServerUser } from "./serverUser";
import { Message, msgStatusEnum, msgType } from "./messages";
import { ObjectId } from "mongodb";
import { getMostRecentStatus } from "../components/util/functions";


export interface iRecipientStatuses {
    [userID: string] : {
        "0queued": string | null,
        "1sending": string | null,
        "2sent": string | null,
        "3delivered": string | null,
        "4read": string | null
    }
}


export class ServerMessage {

    constructor({message, messageType, messageData, _id, chatID, sender, timestamp, recipientStatuses} : 
        {message: string, messageType:msgType, messageData: string, _id: ObjectId|string, chatID: ObjectId, sender: ServerUser, timestamp: string, recipientStatuses: iRecipientStatuses}) {
        this.message = message;
        this.sender = new ServerUser(sender);
        this.timestamp = timestamp;
        this._id = typeof _id == "string" ? _id : _id.toString();
        this.recipientStatuses = recipientStatuses;
        this.messageType = messageType;
        this.messageData = messageData;
        this.chatID = chatID;
    }

    public message = ""; //every type of message can have a text message to go along with it
    public messageData = ""; //if the message type just happens to have other data, such as an image, audio, video, etc.
    public messageType : msgType;
    public sender : ServerUser;
    public recipientStatuses: iRecipientStatuses;
    public timestamp : string;
    public _id : ObjectId | string;
    public chatID : ObjectId;

    public export(currUserID: string) {
        
        if (currUserID == this.sender._id) {
            return new Message({...this, status:this.getMostRecentStatus(), sender:this.sender.export(currUserID), read:true, received: true});
        }
        else {
            return new Message({...this, status:this.getMostRecentStatus(), sender:this.sender.export(currUserID), read:(currUserID in this.recipientStatuses ? this.recipientStatuses[currUserID]['4read'] !== null && this.recipientStatuses[currUserID]['4read'] !== undefined : false), received:(currUserID in this.recipientStatuses ? this.recipientStatuses[currUserID]['3delivered'] !== null && this.recipientStatuses[currUserID]['3delivered'] !== undefined : false)});
        }
        
    }

    public getMostRecentStatus() {
        return getMostRecentStatus(this.recipientStatuses);
    }

}