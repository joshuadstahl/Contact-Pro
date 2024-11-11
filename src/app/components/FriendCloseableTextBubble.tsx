import { useState } from "react";
import CloseableTextBubble from "./ClosableTextBubble";
import ProfilePhoto from "./profilePhoto";


export default function FriendCloseableTextBubble({text, photo, className, xCallback} : {text: string, photo: string, className?:String, xCallback: Function}) {

    return (
        <CloseableTextBubble className={"bg-moss_green-200" + ' ' + className} xCallback={xCallback}>
            <ProfilePhoto photo={photo} tSizeNumber={5} className="mb-0.5"/>
            <p className="text-xs text-light ml-1.5 mr-2.5  text-nowrap">{text}</p>
        </CloseableTextBubble>
    )
}