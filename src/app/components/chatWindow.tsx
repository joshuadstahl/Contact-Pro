'use client'
import React, { EventHandler, FormEvent, FormEventHandler, useEffect, useState } from 'react';
import { Chat, ChatButtonGroup, GroupChat, Message as MessageClass, User, UserChat, msgDisplayType, userStatus } from './util/classes'
import ProfilePhoto from './profilePhoto';
import Message from "./messageComponents/message";
import { msgStatusEnum } from './messageComponents/msgStatus';
import MessageDaySeperator from './messageComponents/messageDaySeperator';
import Link from 'next/link';
import Image from 'next/image';
import MessageDisplayWrapper from './messageComponents/messageDisplayWrapper';
import { GetColorBgClass, GetStatusName } from './util/functions';

function ChatWindow({chat, oldestUnreadMessageID} : {chat: Chat | UserChat | GroupChat, oldestUnreadMessageID: string}) {
    
    //get the color of the status bubble
    let statusColor = GetColorBgClass(chat.chatStatus);

    //determine whether to show the status bubble or not.
    let statusBubble = true;
    if (chat.constructor != UserChat) {
        statusBubble = false;
    }

    //determine what kind of screen to show
    let type = "full";
    if (chat.chatID == "0") {
        type = "empty";
    }

    return (
        (type == "full" && 

            <div className="basis-2/3 
            border-solid rounded-r-my
            bg-ghost_white flex flex-col">
                <div className='flex flex-row flex-nowrap items-center py-2.5 pl-5 border-solid border-1 border-persian_orange rounded-tr-my'>
                    <div className="relative">
                        <ProfilePhoto photo={chat.photo} tSizeNumber={10}/>
                        {statusBubble && <div title={GetStatusName(chat.chatStatus)} className={"absolute bottom-0 right-0 rounded-full " + statusColor + " w-2.5 h-2.5"}></div> }
                    </div>
                    <h2 className='ml-2.5 text-persian_green text-xl'>{chat.name}</h2>
                    {chat.constructor == UserChat &&<p className='text-charcoal ml-2.5'>({chat.otherUser.userID})</p>}
                </div>
                <div className='grow flex flex-col border-solid border-1 border-cadet_gray-300 rounded-br-my p-5 overflow-x-hidden overflow-y-auto'>
                    
                    <div className="grow flex flex-col flex-initial max-w-full max-h-full overflow-x-hidden overflow-y-auto">
                        <div className='mb-5 grow overflow-y-auto custom_scrollbars'>
                            <MessageDisplayWrapper chat={chat} unreadMessagesStartID={oldestUnreadMessageID}/>
                        </div>
                        <div key={chat.chatID + "msgBar"} className='relative flex flex-row outline-none border-solid border-1 border-cadet_gray-200 rounded-my py-2.5 px-5
                            bg-white text-light text-xs overflow-x-hidden wrap-none items-center shrink-0'>
                            
                            <div className="mr-2.5 shrink-0" style={{maxWidth: "15px", maxHeight:"15px"}}>
                                <button><Image className="filter-charcoal" alt='add photo' src='/icons/add-photo.svg' width={15} height={15}></Image></button>
                            </div>
                            {
                                //@ts-ignore
                                <div contentEditable={true} placeholder={"Type a message"}
                                    className='outline-none text-wrap break-all whitespace-pre-wrap overflow-hidden grow'>
                                </div>
                            }
                            <div className='shrink-0 ml-2.5' style={{maxWidth: "15px", maxHeight:"15px"}}>
                                <button><i className="bi bi-send stroke-1 text-charcoal"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>) ||
            
        type == "empty" && 
            <div className="basis-2/3 p-2.5 
            border-solid border-1 border-cadet_gray-300 rounded-r-my
            bg-ghost_white">
                <div className='flex flex-row flex-nowrap items-center min-h-full'>
                    <h2 className='grow font-light text-base text-center'>Select a contact or group chat to get started</h2>
                </div>
            </div>
        
    );
}

export default ChatWindow;