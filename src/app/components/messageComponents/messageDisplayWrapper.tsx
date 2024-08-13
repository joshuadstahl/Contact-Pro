import MessageDaySeperator from "./messageDaySeperator";
import MsgStatus from "./msgStatus";
import Message from "./message";
import { Chat, Message as MessageC, msgType, User } from "../util/classes";
import { GetFancyDate } from "../util/functions";

export default function MessageDisplayWrapper({chat} : {chat: Chat}) {

    let lastDate = ""; //the date of the last message processed
    let lastSender = ""; //the sender of the last message processed

    return (
    <div key={chat.chatID}>
        {
            //go through all the messages, updating the status variables
            //above as it goes and inserting appropriate message styles and 
            //seperators as needed
            chat.messages.map((x:MessageC) => {
                //if there last date doesn't match the current one, add
                //a day seperator
                if (x.timestamp.toLocaleDateString() != lastDate) {
                    lastDate = x.timestamp.toLocaleDateString();
                    //if the last sender doesn't match the current sender
                    //reset the lastSender
                    if (lastSender != x.sender.userID) {
                        lastSender = x.sender.userID;
                    }
                    return (
                        <div key={x.timestamp.getMilliseconds()}>
                            <MessageDaySeperator day={GetFancyDate(x.timestamp)}/>
                            <Message key={x.msgID} theMessage={x} type={msgType.NEW}/>
                        </div>
                    )
                }
                else {
                    if (lastSender != x.sender.userID) {
                        lastSender = x.sender.userID;
                        return (<Message key={x.msgID} theMessage={x} type={msgType.NEW}/>)
                    }
                    else {
                        return (<Message key={x.msgID} theMessage={x} type={msgType.CONT}/>)
                    }
                }
            })
        }
    </div>
    )
}