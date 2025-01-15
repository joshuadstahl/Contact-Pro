import Link from 'next/link';
import ChatPhoto from '../photo/chatPhoto';
import { GetFancyDate, GetFancyTime } from '../../functions/functions';
import { useContext } from 'react';
import { CurrentUserContext } from '../../context/currentUserContext';
import { UserRepositoryContext } from '../../context/userRepositoryContext';
import { chatRepository } from '../../app/page';

export default function ChatButton({chats, chatID, selected, setSelected, title = ""}: {chats: chatRepository, chatID: string, selected: boolean, setSelected: (chatID: string) => void, title?: string}) {

    //get the current application user from the context API
    const currUser = useContext(CurrentUserContext);
    const userRepo = useContext(UserRepositoryContext);

    let chat = chats[chatID];

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
    else if (chat.messages[chat.messages.length - 1].sender._id == currUser) {
        italics = true;
        italicsMessage = "You: ";
    }

    return (
        <Link onClick={() => setSelected(chat.chatID)} id={chat.chatID} href="" className={"hover:bg-french_gray-100 " +
        "focus:bg-french_gray-200 active:bg-french_gray rounded-l-my rounded-t-my rounded-br min-w-0 " + 
        (selected === true ? "bg-french_gray-200" : " ")}>
            <div className="flex flex-row p-2 gap-6">
                <div className="basis-auto relative shrink-0">
                    <ChatPhoto showUnreadMessages={true} chat={chat} title={title == "" ? chat.name : title}/>
                </div>

                <div className='flex flex-col gap-auto flex-nowrap min-w-0 grow pb-[3px] pt-0.5'>
                    <h3 className="text-normal text-persian_green grow text-base truncate" title={title == "" ? chat.name : title}>{chat.name ?? "Chat name 1"}</h3>
                    
                    <div className="flex flex-row">
                        {italics && <p className={'font-light text-charcoal text-xs italic mr-1' + (chat.lastMessage === undefined ? " truncate italicsExtraSpace" : "")} title={italicsMessage + " " + (chat.lastMessage ?? "")}>{italicsMessage}</p>}
                        <p className="font-light text-charcoal text-xs truncate" title={italicsMessage + " " + (chat.lastMessage ?? "")}>{chat.lastMessage ?? ""}</p>
                    </div>
                </div>
                <div className='flex flex-col items-end pt-[3px] shrink-0'>
                    <div className="font-light text-charcoal text-sm leading-none" title={chat.lastMessageTime === undefined ? "N/A" : GetFancyTime(chat.lastMessageTime)}>{chat.lastMessageTime === undefined ? "N/A" : GetFancyDate(chat.lastMessageTime)}</div>
                </div>
            </div>
        </Link>
        
    );
}