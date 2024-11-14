import React, { useContext } from "react";
import { Message as MessageClass, msgDisplayType } from "@/app/classes/messages";
import ProfilePhoto from "../profilePhoto";
import MsgStatus from "./msgStatus";
import { CurrentUserContext } from "../context/currentUserContext";
import { UserRepositoryContext } from "../context/userRepositoryContext";
import { GetFancyDate } from "../util/functions";


export default function Message({theMessage, type, messageResendCallback} : {theMessage: MessageClass, type: msgDisplayType, messageResendCallback: (msg: MessageClass) => {}}) {
    
    const currUser = useContext(CurrentUserContext);
    const userRepo = useContext(UserRepositoryContext);
    let msgFromUser = theMessage.sender._id == currUser;

    function callback () {
        messageResendCallback(theMessage);
    }

    return ((type == msgDisplayType.NEW && 

        <div id={theMessage.msgID} className="flex flex-row mt-5 msg">
            <ProfilePhoto photo={userRepo[theMessage.sender._id].photo ?? ""} tSizeNumber={10}/>
            <div className="ml-2">
                <div className="flex flex-row flex-nowrap items-center">
                    <h3 className={"font-medium text-sm " + (msgFromUser ? "text-coral" : "text-persian_green")} >{userRepo[theMessage.sender._id].name ?? ""}</h3>
                    <p className="font-light text-xs text-charcoal-950 ml-3">{
                        GetFancyDate(theMessage.timestamp)
                    }</p>
                </div>
                <div className="flex flex-row flex-nowrap items-center">
                    <p className={"font-light text-sm leading-4 mt-0.5 msgText border-r pr-2.5" + (theMessage.failedSent ? " text-do_not_disturb" : " text-charcoal-950")}>{theMessage.message}</p>
                    <MsgStatus timestamp={theMessage.timestamp} msgStatus={theMessage.status} msgFromUser={msgFromUser} failedSend={theMessage.failedSent} resendCallback={callback}/>
                </div>
            </div>
        </div>

    ) || 
    ( 
        <div id={theMessage.msgID} className="flex flex-row flex-nowrap items-center msg ml-12">
            <p className={"font-light text-sm leading-4 mt-0.5 msgText border-french_gray-400 pr-2.5" + (theMessage.failedSent ? " text-do_not_disturb" : " text-charcoal-950")}>{theMessage.message}</p>
            <MsgStatus timestamp={theMessage.timestamp} msgStatus={theMessage.status} msgFromUser={msgFromUser} failedSend={theMessage.failedSent} resendCallback={callback}/>
        </div>
    ))
}