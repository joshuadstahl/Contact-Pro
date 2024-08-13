import Link from 'next/link';
import { Chat, userStatus } from './util/classes';
import ChatPhoto from './chatPhoto';
import { GetFancyDate } from './util/functions';
import { useContext } from 'react';
import { CurrentUserContext } from './context/currentUserContext';

export default function chatButton({chat, selected, setSelected}: {chat: Chat, selected: boolean, setSelected: Function}) {

    //get the current application user from the context API
    let currUser = useContext(CurrentUserContext);

    //set the last message text to "Send a new message to {chat's name}"
    //if the last message is not existant. Also set this message to be
    //italic. If the last message was sent by the current user,
    //then set the italic message to "You: ". This code is just styling basically
    let italics = false;
    let italicsMessage = "";
    if (chat.lastMessage === undefined) {
        italics = true;
        italicsMessage = "Send a new message to " + chat.name;
    }
    else if (chat.messages[chat.messages.length - 1].sender.userID == currUser.userID) {
        italics = true;
        italicsMessage = "You: ";
    }

    return (
        <Link onClick={() => setSelected(chat.chatID)} id={chat.chatID} href="" className={"hover:bg-french_gray-100 " +
        "focus:bg-french_gray-200 active:bg-french_gray rounded-l-my rounded-t-my rounded-br " + 
        (selected === true ? "bg-french_gray-200" : " ")}>
            <div className="flex flex-row p-2 shrink grow">
                <div className="basis-auto relative">
                    <ChatPhoto showUnreadMessages={true} chat={chat}/>
                </div>
                <div className="basis-auto grow shrink pl-4 pt-2">
                    <div className="grid grid-cols-1">
                        <div className="flex flex-row gap-1 mb-1">
                            <div className="text-normal grow text-persian_green text-base leading-none">{chat.name ?? "Chat name 1"}</div>
                            <div className="font-light text-charcoal text-sm leading-none">{chat.lastMessageTime === undefined ? "N/A" : GetFancyDate(chat.lastMessageTime)}</div>
                        </div>
                        <div className="flex flex-row">
                            {italics && <p className='font-light text-charcoal text-xs italic mr-1'>{italicsMessage}</p>}
                            <p className="font-light text-charcoal text-xs truncate">{chat.lastMessage ?? ""}</p>
                            
                        </div>
                    </div>         
                </div>
            </div>
        </Link>
        
    );
}