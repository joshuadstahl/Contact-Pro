import { useState } from "react";
import ProfilePhoto from "./photo/profilePhoto";

export default function InvisibleTextBubble() {

    return (
        <div className={"flex flex-row px-2.5 py-1.5 mr-1.5 rounded-my wrap-none invisible"}>
            <div className="flex flex-row items-center wrap-none">
                <ProfilePhoto photo={"/static/noPhoto.png"} tSizeNumber={5} className="mb-0.5"/>
                <button className="text-xs text-light"><i className="bi bi-x-lg text-charcoal"></i></button>
            </div>
        </div>
    )
}