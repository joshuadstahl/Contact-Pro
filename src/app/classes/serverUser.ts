import { ObjectId } from "mongodb";
import { userStatus, User } from "./user";

export class ServerUser {

    constructor({_id, name, photo, status, email, username, savedStatus = null}: {_id?:string, name: string, photo: string, status: userStatus, email: string, username : string, savedStatus: userStatus | null}) {
        this._id = _id ?? "";
        this.name = name;
        this.photo = photo;
        this.status = status;
        this.email = email;
        this.username = username;
        this.savedStatus = savedStatus;
    }

    public _id: string
    public name = "";
    public photo = "";
    public status = userStatus.OFFLINE;
    public email = "";
    public username = "";
    public savedStatus;

    public export(currUserID: string) {

        let exportStatus;
        if (currUserID == this._id){
            exportStatus = this.savedStatus !== null ? this.savedStatus : this.status;
        }
        else {
            exportStatus = this.status;
        }

        return new User({...this, status: exportStatus});
    }
}