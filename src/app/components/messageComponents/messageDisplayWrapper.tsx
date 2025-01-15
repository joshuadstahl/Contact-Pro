import MessageDaySeperator from "./messageDaySeperator";
import Message from "./message";
import { Chat } from "@/app/classes/chats";
import { Message as MessageC, msgDisplayType } from "@/app/classes/messages";
import { GetFancyDate } from "../../functions/functions";
import NewMessageSeperator from "./newMessageSeperator";
import { useEffect } from "react";

//takes in a Chat object, and the id of the oldest unread message (if applicable)
export default function MessageDisplayWrapper({chat, unreadMessagesStartID, messageResendCallback} : {chat: Chat, unreadMessagesStartID: string, messageResendCallback: (msg: MessageC) => void}) {

    let lastDate = ""; //the date of the last message processed
    let lastSender = ""; //the sender of the last message processed
    let printNewMessageSep = false;
    let printLastMessageID = false;

    let scrollToId = "";
    //set the scrollToId
    if (unreadMessagesStartID != "") {
        //if there is a new message, scroll to the new message seperator
        scrollToId = "newMessagesSep";
    }
    else {
        //if there isn't an new message, scroll to the last message.
        scrollToId = "bottomOfChat";
    }

    useEffect(() => {
        if (scrollToId != "") {
            document.getElementById("newMessagesSep")?.scrollIntoView();
        }
    })

    return (
    <div key={chat.chatID}>
        {
            //go through all the messages, updating the status variables
            //above as it goes and inserting appropriate message styles and 
            //seperators as needed
            chat.messages.map((x:MessageC) => {

                //if the current message matches the id of the oldest unread message, 
                //set a printing a new message seperator flag.
                if (x.msgID == unreadMessagesStartID) {
                    printNewMessageSep = true;
                }
                else {
                    printNewMessageSep = false;
                }

                //if there last date doesn't match the current one, add
                //a day seperator
                if (x.timestamp.toLocaleDateString() != lastDate) {
                    lastDate = x.timestamp.toLocaleDateString();
                    //if the last sender doesn't match the current sender
                    //reset the lastSender
                    if (lastSender != x.sender.username) {
                        lastSender = x.sender.username;
                    }
                    return (
                        <div key={x.timestamp.getMilliseconds() + x.msgID}>
                            <MessageDaySeperator day={GetFancyDate(x.timestamp)}/>
                            {printNewMessageSep && <NewMessageSeperator/>}
                            <Message key={x.msgID + chat.chatID} theMessage={x} type={msgDisplayType.NEW} messageResendCallback={messageResendCallback}/>
                        </div>
                    )
                }
                else {
                    if (lastSender != x.sender.username) {
                        lastSender = x.sender.username;
                        return (
                        <div key={x.timestamp.getMilliseconds() + x.msgID}>
                            {printNewMessageSep && <NewMessageSeperator/>}
                            <Message key={x.msgID + chat.chatID} theMessage={x} type={msgDisplayType.NEW} messageResendCallback={messageResendCallback}/>
                        </div>)
                    }
                    else {
                        return (
                        <div key={x.timestamp.getMilliseconds() + x.msgID}>
                            {printNewMessageSep && <NewMessageSeperator/>}
                            <Message key={x.msgID + chat.chatID} theMessage={x} type={msgDisplayType.CONT} messageResendCallback={messageResendCallback}/>
                        </div>)
                    }
                }
            })
        }
        <div id="bottomOfChat">

        </div>
    </div>
    )
}