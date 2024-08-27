import { msgStatusEnum } from "../messageComponents/msgStatus";
import { useState } from "react";


//the status of a user
export enum userStatus {
    OFFLINE,
    ONLINE,
    DO_NOT_DISTURB
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

export abstract class Chat {

    // constructor({name, messages, chatType = "chat", chatID}
    //     : {"name" : string, messages: Array<Message>, "chatType": string, "chatID": string }) {
    //     this.name = name;
    //     this.lastMessage = lastMessage;
    //     this.lastMessageTime = lastMessageTime;
    //     this.photo = photo;
    //     this.unreadMessages = unreadMessages;
    //     this.chatStatus = chatStatus;
    //     this.chatType = chatType;
    //     this.chatID = chatID;
    // }

    public name = "";
    public lastMessage? = "";
    public lastMessageTime? = new Date();
    public photo = "";
    public unreadMessages = 0;
    public chatStatus = userStatus.OFFLINE;
    public chatID = "";
    public messages = new Array<Message>;

    abstract newMessage({msg}:{msg:Message}) : void;

    protected static sortMessages(msgs: Array<Message>) {
        return( [... msgs].sort((a,b) => {
            if (a.timestamp > b.timestamp) {
                return 1;
            }
            else if (a.timestamp < b.timestamp) {
                return -1;
            }
            return 0;
        }));
    }

    protected setLastMessage() {
        let lastmessage = this.messages[this.messages.length - 1]
        if (lastmessage === undefined) {
            this.lastMessage = undefined;
            this.lastMessageTime = undefined;
        }
        else {
            this.lastMessage = lastmessage.message;
            this.lastMessageTime = lastmessage.timestamp;
        }
    }

    public setAllMessagesRead() {
        this.messages.forEach(msg => {
            msg.read = true;
        });
        this.unreadMessages = 0;
    }
}

export class UserChat extends Chat {

    constructor({user, messages, chatID}
        : {user : User, messages: Array<Message>, "chatID": string }) {
        super();
        this.name = user.name;
        this.photo = user.photo;
        this.unreadMessages = messages.filter((x:Message) => x.read == false).length;
        this.chatStatus = user.status;
        this.chatID = chatID;
        this.messages = Chat.sortMessages(messages);
        this.setLastMessage();
        this.otherUser = user;

    }

    public otherUser;

    newMessage({ msg }: { msg: Message; }): void {
        this.messages.push(msg);
        this.messages = Chat.sortMessages(this.messages);
        this.unreadMessages = this.messages.filter((x:Message) => x.read == false).length;
        this.setLastMessage();
    }

}

export class GroupChat extends Chat {
    constructor({name, messages, photo, chatID}
        : {"name" : string, messages: Array<Message>, photo: string, "chatID": string }) {
        super();
        this.name = name;
        this.photo = photo;
        this.unreadMessages = messages.filter((x:Message) => x.read == false).length;
        this.chatID = chatID;
        this.messages = [... messages].sort((a,b) => {
            if (a.timestamp > b.timestamp) {
                return 1;
            }
            else if (a.timestamp < b.timestamp) {
                return -1;
            }
            return 0;
        });
        this.setLastMessage();
    }

    newMessage({ msg }: { msg: Message; }): void {
        this.messages.push(msg);
        this.messages = Chat.sortMessages(this.messages);
        this.unreadMessages = this.messages.filter((x:Message) => x.read == false).length;
        this.setLastMessage();
    }
}

export class BlankChat extends Chat {
    chatID = "0";

    newMessage({ msg }: { msg: Message; }): void {
        
    }
}



export class User {

    constructor({name, photo, status, email, username}: {name: string, photo: string, status: userStatus, email: string, username : string}) {
        this.name = name;
        this.photo = photo;
        this.status = status;
        this.email = email;
        this.username = username;
    }

    public name = "";
    public photo = "";
    public status = userStatus.OFFLINE;
    public email = "";
    public username = "";
}



export class Message {

    constructor({message, msgID, sender, timestamp, status, read} : 
        {message: string, msgID: string, sender: User, timestamp: Date, status: msgStatusEnum, read: boolean}) {
        this.message = message;
        this.sender = sender;
        this.timestamp = timestamp;
        this.msgStatus = status;
        this.read = read;
        this.msgID = msgID;
    }

    public message = ""; //every type of message can have a text message to go along with it
    public messageData = ""; //if the message type just happens to have other data, such as an image, audio, video, etc.
    public messageType = msgType.TEXT;
    public sender : User;
    //public recipient: User;
    public timestamp = new Date();
    public msgStatus = msgStatusEnum.Queued;
    public read = false;
    public msgID = "";

}

export class TextMessage {

}

export class ImageMessage {

}

export class ChatButtonGroup {

    constructor({chat, selected = false}: {chat: Chat, selected: boolean}) {
        this.chat = chat;
        this.selected = selected;
    }

    public chat: Chat;
    public selected = false;
}