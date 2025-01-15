import { useState } from "react";
import CloseableTextBubble from "./ClosableTextBubble";
import ProfilePhoto from "./photo/profilePhoto";


export default function FriendCloseableTextBubble({name, username, photo, className, xCallback} : {name: string, username: string, photo: string, className?:String, xCallback: () => void}) {

    return (
        <CloseableTextBubble className={"bg-moss_green-200" + ' ' + className} xCallback={xCallback}>
            <ProfilePhoto photo={photo} tSizeNumber={5} className="mb-0.5" title={name + " (" + username + ")"}/>
            <p className="text-xs text-light ml-1.5 mr-2.5 text-nowrap" title={name + " (" + username + ")"}>{name}</p>
        </CloseableTextBubble>
    )
}