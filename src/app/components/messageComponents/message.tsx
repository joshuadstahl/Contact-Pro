import React, { useContext } from "react";
import {Message as MessageClass, User, msgDisplayType} from '../util/classes';
import ProfilePhoto from "../profilePhoto";
import MsgStatus from "./msgStatus";
import { CurrentUserContext } from "../context/currentUserContext";
import { GetFancyDate } from "../util/functions";


export default function Message({theMessage, type} : {theMessage: MessageClass, type: msgDisplayType}) {
    
    let currDate = new Date();
    let currUser = useContext(CurrentUserContext);
    let msgFromUser = theMessage.sender.userID == currUser.userID;

    return ((type == msgDisplayType.NEW && 

        <div id={theMessage.msgID} className="flex flex-row mt-5 msg">
            <ProfilePhoto photo={theMessage.sender.photo} tSizeNumber={10}/>
            <div className="ml-2">
                <div className="flex flex-row flex-nowrap items-center">
                    <h3 className={"font-medium text-sm " + (msgFromUser ? "text-coral" : "text-persian_green")} >{theMessage.sender.name}</h3>
                    <p className="font-light text-xs text-charcoal-950 ml-3">{
                        GetFancyDate(theMessage.timestamp)
                    }</p>
                </div>
                <div className="flex flex-row flex-nowrap items-center">
                    <p className="font-light text-sm text-charcoal-950 leading-4 mt-0.5 msgText border-r pr-2.5">{theMessage.message}</p>
                    <MsgStatus timestamp={theMessage.timestamp} msgStatus={theMessage.msgStatus} msgFromUser={msgFromUser}/>
                </div>
            </div>
        </div>

    ) || 
    ( 
        <div id={theMessage.msgID} className="flex flex-row flex-nowrap items-center msg ml-12">
            <p className="font-light text-sm text-charcoal-950 leading-4 mt-0.5 msgText border-french_gray-400 pr-2.5">{theMessage.message}</p>
            <MsgStatus timestamp={theMessage.timestamp} msgStatus={theMessage.msgStatus} msgFromUser={msgFromUser}/>
        </div>
    ))
}