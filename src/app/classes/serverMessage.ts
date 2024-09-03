import { ServerUser } from "./serverUser";
import { Message, msgStatusEnum, msgType } from "./messages";
import { User } from "./user";
import { ObjectId } from "mongodb";


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
            return new Message({...this, status:this.getMostRecentStatus(), sender:this.sender.export(currUserID), read:true});
        }
        else {
            return new Message({...this, status:this.getMostRecentStatus(), sender:this.sender.export(currUserID), read:(currUserID in this.recipientStatuses ? this.recipientStatuses[currUserID]['4read'] !== null && this.recipientStatuses[currUserID]['4read'] !== undefined : false)});
        }
        
    }

    public getMostRecentStatus() {
        if (Object.keys(this.recipientStatuses).length == 1) {
            let lastValidStatus = 0;
            let userID = Object.keys(this.recipientStatuses)[0]; //get the userID
            let userData = this.recipientStatuses[userID]; //the data for the userID
            let userKeys2 = Object.keys(this.recipientStatuses[userID]).sort(); //the keys for the statuses under the userID
            
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
            let unameList = Object.keys(this.recipientStatuses); //get a list of recipient userIDs
            let maxStatus = new Array<Number>; //array of the max status (most recent status) for each of the userIDs

            unameList.forEach(userID => {
                let lastValidStatus = 0;
                let userData = this.recipientStatuses[userID]; //the data for the userID
                let userKeys2 = Object.keys(this.recipientStatuses[userID]).sort(); //the keys for the statuses under the userID
                
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

}