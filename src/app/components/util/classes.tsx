import { msgStatusEnum } from "../messageComponents/msgStatus";
import { useState } from "react";


export enum userStatus {
    OFFLINE,
    ONLINE,
    DO_NOT_DISTURB
}

export enum msgType {
    NEW,
    CONT
}


export class Chat {

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
        this.messages = [... messages].sort((a,b) => {
            if (a.timestamp > b.timestamp) {
                return 1;
            }
            else if (a.timestamp < b.timestamp) {
                return -1;
            }
            return 0;
        });
        let lastmessage = this.messages[this.messages.length - 1]
        if (lastmessage === undefined) {
            this.lastMessage = undefined;
            this.lastMessageTime = undefined;
        }
        else {
            this.lastMessage = lastmessage.message;
            this.lastMessageTime = lastmessage.timestamp;
        }
        this.otherUser = user;

    }

    public otherUser;

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
}

export class BlankChat extends Chat {
    chatID = "0";
}



export class User {

    constructor({name, photo, status, userID}: {name: string, photo: string, status: userStatus, userID : string}) {
        this.name = name;
        this.photo = photo;
        this.status = status;
        this.userID = userID;
    }

    public name = "";
    public photo = "";
    public status = userStatus.OFFLINE;
    public userID = "";
}



export class Message {

    constructor({message, msgID, sender, timestamp, status, read} : {message: string, msgID: string, sender: User, timestamp: Date, status: msgStatusEnum, read: boolean}) {
        this.message = message;
        this.sender = sender;
        this.timestamp = timestamp;
        this.msgStatus = status;
        this.read = read;
        this.msgID = msgID;
    }

    public message = "";
    public sender : User;
    public timestamp = new Date();
    public msgStatus = msgStatusEnum.Queued;
    public read = false;
    public msgID = "";

}

export class ChatButtonGroup {

    constructor({chat, selected = false}: {chat: Chat, selected: boolean}) {
        this.chat = chat;
        this.selected = selected;
    }

    public chat: Chat;
    public selected = false;
}