import { ObjectId } from "mongodb";
import { userStatus, User } from "./user";

export class ServerUser {

    constructor({_id, name, photo, status, email, username, savedStatus = null, friends}: {_id?:string, name: string, photo: string, status: userStatus, email: string, username : string, savedStatus: userStatus | null, friends: Array<ObjectId> | Array<string>}) {
        this._id = _id ?? "";
        this.name = name;
        this.photo = photo;
        this.status = status;
        this.email = email;
        this.username = username;
        this.savedStatus = savedStatus;
        this.friends = friends !== undefined ? friends.map((frnd) => frnd.toString()) : [];
    }

    public _id: string
    public name = "";
    public photo = "";
    public status = userStatus.OFFLINE;
    public email = "";
    public username = "";
    public savedStatus;
    public friends : Array<string>;

    public export(currUserID: string) {

        let exportStatus;
        let email;
        if (currUserID.toString() == this._id.toString()){
            exportStatus = this.savedStatus !== null ? this.savedStatus : this.status;
            email = this.email;
        }
        else {
            exportStatus = this.status;
            email = "";
        }

        return new User({...this, status: exportStatus, email: email});
    }
}