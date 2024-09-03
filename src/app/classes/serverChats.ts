import { ObjectId } from "mongodb";
import { iRecipientStatuses, ServerMessage } from "./serverMessage";
import { userStatus, User } from "./user";
import { ServerUser } from "./serverUser";
import { Message } from "./messages";

export class ServerChat {

    constructor({name, messages, chatType = "chat", photo, _id, members, membersArray, accessingUser}
        : {name : string, messages: Array<ServerMessage>, chatType: string, photo: string, _id: string, 
            members:Array<ServerUser>, membersArray:Array<ObjectId>, accessingUser: string }) {
        this.name = name;
        //if it is a one-on-one chat
        if (chatType == "user") {
            let membersCopy = members.filter((mem) => {
                if (mem.username == accessingUser) {
                    return false;
                }
                return true;
            })
            this.photo = membersCopy[0].photo;
            this.otherUser = membersCopy[0];
        }
        else {
            this.photo = photo;
        }        
        this.chatType = chatType;
        this._id = _id.toString();
        this.messages = messages;
        this.members = members;
        this.membersArray = membersArray.map((m) => {
            return new ObjectId(m);
        });
        this.accessingUser = accessingUser;
    }

    public name = "";
    public photo = "";
    public chatStatus = userStatus.OFFLINE;
    public _id : string;
    public chatType = "";
    public messages = new Array<ServerMessage>;
    public members = new Array<ServerUser>;
    public membersArray = new Array<ObjectId>;
    public otherUser: User|undefined;
    public accessingUser: string;

    public export(currUserID: string) {

        //handle the messages
        let messages = this.messages.map((msg: ServerMessage) => {
            let newM = new ServerMessage(msg);
            return newM.export(currUserID);
        })
        //if there are no messages, return an empty array
        if (messages.length == 0) {
            messages = new Array;
        }

        //handle the members by converting the serverUsers to regular users.
        let membersToUsers = this.members.map((mbr: ServerUser) => {
            let newServerUser = new ServerUser(mbr);
            return newServerUser.export(currUserID);
        })


        return ({
            chatID: this._id.toString(),
            name: this.name,
            chatType: this.chatType,
            photo: this.photo,
            messages: messages,
            members: membersToUsers,
            membersArray: this.membersArray,
            otherUser: this.otherUser === undefined ? undefined : new User(this.otherUser)
        })

    }

}