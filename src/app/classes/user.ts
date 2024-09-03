import { ObjectId } from "mongodb";

//the status of a user
export enum userStatus {
    OFFLINE,
    ONLINE,
    DO_NOT_DISTURB
}

export class User {

    constructor({_id, name, photo, status, email, username}: {_id: string | ObjectId, name: string, photo: string, status: userStatus, email: string, username : string}) {
        this._id = _id.toString();
        this.name = name;
        this.photo = photo;
        this.status = status;
        this.email = email;
        this.username = username;
    }

    public _id: string;
    public name = "";
    public photo = "";
    public status = userStatus.OFFLINE;
    public email = "";
    public username = "";
}