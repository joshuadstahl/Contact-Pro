import { Chat, UserChat, userStatus } from './util/classes';
import PPhoto from "./profilePhoto";
import { GetColorClass } from './util/functions';


export default function ChatPhoto({chat, showUnreadMessages = true, } : {chat: Chat, showUnreadMessages: boolean}) {

    let statusColor = GetColorClass(chat.chatStatus);

    return (
        <div className="relative">
            <PPhoto photo={chat.photo}/>
            {chat.constructor == UserChat && <div className={"absolute bottom-0.5 right-0.5 rounded-full " + statusColor + " w-2.5 h-2.5"}></div>}
            {
                chat.unreadMessages > 0 && showUnreadMessages && <div className="absolute flex flex-row flex-nowrap items-center place-content-center
                top-0 -right-1 rounded-full bg-persian_orange w-5 h-5">
                    <p className="text-center text-white text-[10px] ">{chat.unreadMessages > 9 ? "9+" : chat.unreadMessages}</p>
                </div>
            }
        </div>
    )
    
}