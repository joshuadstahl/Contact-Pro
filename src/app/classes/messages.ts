import { ObjectId } from "mongodb";
import { User } from "./user";
import { time } from "console";

//the status of a message
export enum msgStatusEnum {
    Queued,
    Sending,
    Sent,
    Delivered,
    Read,
    ReadCompact
}

//the type of message to display
export enum msgDisplayType {
    NEW,
    CONT
}

//stores the type of message
export enum msgType {
    TEXT,
    PHOTO,
    VIDEO,
    AUDIO
}

export class Message {

    constructor({message, _id, sender, timestamp, status = undefined, read, received, failedSent = false} : 
        {message: string, _id: string|ObjectId, sender: User, timestamp: Date | string, status?: msgStatusEnum | undefined, read: boolean, received: boolean, failedSent?: boolean}) {
        this.message = message;
        this.sender = sender;
        this.timestamp = typeof timestamp  == "string" ? new Date(timestamp) : timestamp;
        this.status = status;
        this.read = read;
        this.received = received;
        this.msgID = _id.toString();
        this.failedSent = failedSent;
    }

    public message = ""; //every type of message can have a text message to go along with it
    public messageData = ""; //if the message type just happens to have other data, such as an image, audio, video, etc.
    public messageType = msgType.TEXT;
    public sender : User;
    public timestamp = new Date();
    public status?;
    public received = false;
    public read = false;
    public msgID = "";
    public failedSent = false;

}

export class TextMessage {

}

export class ImageMessage {

}