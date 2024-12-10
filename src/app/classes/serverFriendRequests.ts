import { ObjectId } from "mongodb";
import { ServerUser } from "./serverUser";

export class ServerFriendRequest {
    public _id: ObjectId;
    public sender: ServerUser;
    public recipient: ServerUser;
    public timestamp: Date;

    constructor({_id, sender, recipient, timestamp} : 
        {_id: ObjectId|string, sender: ServerUser, recipient: ServerUser, timestamp: Date | string}) {
        
        this._id = new ObjectId(_id.toString());
        this.sender = new ServerUser(sender);
        this.recipient = new ServerUser(recipient);
        this.timestamp = typeof timestamp  == "string" ? new Date(timestamp) : timestamp;
    }

    public export(currUserID: string) {
        return {
            ...this,
            sender: this.sender.export(currUserID),
            recipient: this.recipient.export(currUserID)
        }
    }
}

export class RawServerFriendRequest {
    public _id: ObjectId;
    public sender: ObjectId;
    public recipient: ObjectId;
    public timestamp: Date;

    constructor({_id, sender, recipient, timestamp} : 
        {_id: ObjectId|string, sender: ObjectId|string, recipient: ObjectId|string, timestamp: Date | string}) {
        
        this._id = new ObjectId(_id.toString());
        this.sender = new ObjectId(sender.toString());
        this.recipient = new ObjectId(recipient.toString());
        this.timestamp = typeof timestamp  == "string" ? new Date(timestamp) : timestamp;
    }
}