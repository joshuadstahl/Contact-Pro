import { Chat, UserChat } from '../classes/chats';
import PPhoto from "./profilePhoto";
import { GetColorBgClass, GetStatusName } from './util/functions';
import { useContext } from 'react';
import { UserRepositoryContext } from './context/userRepositoryContext';


export default function ChatPhoto({chat, showUnreadMessages = true, title="" } : {chat: Chat, showUnreadMessages: boolean, title?: string}) {

	const userRepo = useContext(UserRepositoryContext);

	let statusColor = GetColorBgClass(chat.constructor == UserChat ? userRepo[(chat as UserChat).otherUser._id].status : chat.chatStatus); //get the user's status from the user repository, or the chat's status
	let statusName = GetStatusName(chat.constructor == UserChat ? userRepo[(chat as UserChat).otherUser._id].status : chat.chatStatus); //get the user's status from the user repository, or the chat's status
	let chatPhoto = chat.constructor == UserChat ? userRepo[(chat as UserChat).otherUser._id].photo : chat.photo

	return (
		<div className="relative">
			<PPhoto photo={chatPhoto} title={title}/>
			{chat.constructor == UserChat && <div title={statusName} className={"absolute bottom-0.5 right-0.5 rounded-full " + statusColor + " w-2.5 h-2.5"}></div>}
			{
				chat.unreadMessages > 0 && showUnreadMessages && <div className="absolute flex items-center justify-center top-0 -right-1 rounded-full bg-persian_orange size-5 shadow-notify">
					<p className="text-center text-white text-[0.625rem] leading-[1.25rem] -mb-[0.03868rem]">{chat.unreadMessages > 9 ? "9+" : chat.unreadMessages}</p>
				</div>
			}
		</div>
	)
	
}