import { Message } from "./messages";
import { userStatus, User } from "./user";

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

    public setAllMessagesRead(wsSend: Function, currUserID: string) {
        this.messages.forEach(msg => {
            //if the message hasn't been read and the sender of the message isn't
            //the current user, send em' updates out!
            if (msg.read == false && msg.sender._id != currUserID) {
                wsSend({msgType: "messageUpdate", data: {_id: msg.msgID, read: true}});
            }
            msg.read = true;
        });
        this.unreadMessages = 0;
    }
}

export class UserChat extends Chat {

    constructor({otherUser, messages, chatID, name}
        : {otherUser : User, messages: Array<Message>, chatID: string, name: string }) {
        super();
        this.name = name == "" ? otherUser.name : name;
        this.photo = otherUser.photo;
        this.unreadMessages = messages.filter((x:Message) => x.read == false).length;
        this.chatStatus = otherUser.status;
        this.chatID = chatID;
        this.messages = Chat.sortMessages(messages);
        this.setLastMessage();
        this.otherUser = otherUser;

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