import { User } from "./user";

export class FriendRequest {
    public _id: string;
    public sender: User;
    public recipient: User;
    public timestamp: Date;

    constructor({_id, sender, recipient, timestamp} : 
        {_id: string, sender: User, recipient: User, timestamp: Date | string}) {
        
        this._id = _id.toString();
        this.sender = new User(sender);
        this.recipient = new User(recipient);
        this.timestamp = typeof timestamp  == "string" ? new Date(timestamp) : timestamp;
    }
}