import { Chat, UserChat } from '../classes/chats';
import PPhoto from "./profilePhoto";
import { GetColorBgClass, GetStatusName } from './util/functions';
import { useContext } from 'react';
import { UserRepositoryContext } from './context/userRepositoryContext';


export default function ChatPhoto({chat, showUnreadMessages = true, } : {chat: Chat, showUnreadMessages: boolean}) {

	const userRepo = useContext(UserRepositoryContext);

	let statusColor = GetColorBgClass(chat.constructor == UserChat ? userRepo[(chat as UserChat).otherUser._id].status : chat.chatStatus); //get the user's status from the user repository, or the chat's status
	let statusName = GetStatusName(chat.constructor == UserChat ? userRepo[(chat as UserChat).otherUser._id].status : chat.chatStatus); //get the user's status from the user repository, or the chat's status
	let chatPhoto = chat.constructor == UserChat ? userRepo[(chat as UserChat).otherUser._id].photo : chat.photo

	return (
		<div className="relative">
			<PPhoto photo={chatPhoto}/>
			{chat.constructor == UserChat && <div title={statusName} className={"absolute bottom-0.5 right-0.5 rounded-full " + statusColor + " w-2.5 h-2.5"}></div>}
			{
				chat.unreadMessages > 0 && showUnreadMessages && <div className="absolute flex flex-row flex-nowrap items-center place-content-center
				top-0 -right-1 rounded-full bg-persian_orange w-5 h-5">
					<p className="text-center text-white text-[10px] ">{chat.unreadMessages > 9 ? "9+" : chat.unreadMessages}</p>
				</div>
			}
		</div>
	)
	
}