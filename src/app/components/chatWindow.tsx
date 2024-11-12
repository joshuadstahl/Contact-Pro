'use client'
import React, {KeyboardEvent, MouseEvent, useContext, useEffect, useState} from 'react';
import { BlankChat, GroupChat, UserChat } from '../classes/chats';
import { Message as MessageClass, msgType } from '../classes/messages';
import ProfilePhoto from './profilePhoto';
import Image from 'next/image';
import MessageDisplayWrapper from './messageComponents/messageDisplayWrapper';
import { GetColorBgClass, GetStatusName } from './util/functions';
import { chatRepository, userRepository } from '../app/page';
import { CurrentUserContext } from './context/currentUserContext';
import ChatWindowModal from './modals/ChatWindowModal';
import AddNewChatModal from './modals/AddNewChatModal';


function ChatWindow({chatID, userRepo, sendWSMessage, addNewMessage, chatGroups, chatGroupsUpdater, oldestUnreadMessageID, 
    addingChat, setAddingChat} : {chatID: string, userRepo: userRepository, sendWSMessage:Function, 
        addNewMessage: Function, chatGroups: chatRepository, chatGroupsUpdater: Function, oldestUnreadMessageID: string, 
         addingChat: boolean, setAddingChat: Function}) {
    
    const currUser = useContext(CurrentUserContext);
    let chat = chatGroups[chatID] ?? new BlankChat();
    if (chat.constructor == UserChat) {
        chat = chat as UserChat;
        
    }
    else if (chat.constructor == GroupChat) {
        chat = chat as GroupChat;
    }

    //get the color of the status bubble
    let statusColor = GetColorBgClass(chat.constructor == UserChat ? userRepo[chat.otherUser._id].status : chat.chatStatus);

    //determine the profile photo
    let photo;
    if (chat.constructor == UserChat) {
        photo = userRepo[chat.otherUser._id].photo;
    }
    else {
        photo = chat.photo;
    }

    //determine what kind of screen to show
    let type = "full";
    if (chat.chatID == "0") {
        type = "empty";
    }

    async function sendMessage() {
        let messageField = document.getElementById("messageField");
        let message = messageField?.textContent ?? "blank message";
        if (message != "") {
            let out = {
                msgType: "message",
                data: {
                    _id: Math.round(Math.random() * 5000).toString(),
                    chatID: chat.chatID, 
                    message: message,
                    messageData: "", 
                    messageType: msgType.TEXT
                }
            }
            if(messageField !== undefined && messageField?.textContent !== undefined){
                messageField.textContent = "";
            }
            let data = out.data;

            // sendWSMessage(out);
            try {
                addNewMessage(new MessageClass({...data, sender: userRepo[currUser], timestamp: new Date(), read: true, received:true, status:0}), chat.chatID);
                let res = await fetch("/api/message", {method: "POST", body: JSON.stringify(data)});
                if (res.ok) {
                    
                }
            }
            catch (err) {
                console.log(err);
            }

            
        }
    }

    function textFieldKeyDown(evt: KeyboardEvent) {
        if (evt.key == "Enter" && evt.shiftKey == false) {
            evt.preventDefault();
            sendMessage();
        }
    }


    return (
        <div className="basis-2/3 rounded-r-my
            bg-ghost_white flex flex-col relative">
            {type == "full" && <div className='flex flex-row flex-nowrap items-center py-2.5 pl-5 border-solid border-1 border-persian_orange rounded-tr-my'>
                <div className="relative">
                    <ProfilePhoto photo={photo} tSizeNumber={10}/>
                    {chat.constructor == UserChat && <div title={GetStatusName(userRepo[chat.otherUser._id].status)} className={"absolute bottom-0 right-0 rounded-full " + statusColor + " w-2.5 h-2.5"}></div> }
                </div>
                <h2 className='ml-2.5 text-persian_green text-xl'>{chat.name}</h2>
                {chat.constructor == UserChat && <p className='text-charcoal ml-2.5'>({chat.otherUser.username})</p>}
            </div>}
            {type == "full" && <div className='grow flex flex-col border-solid border-1 border-cadet_gray-300 rounded-br-my p-5 overflow-x-hidden overflow-y-auto'>
            
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
                            <div id="messageField" onKeyDown={textFieldKeyDown} contentEditable={true} placeholder={"Type a message"}
                                className='outline-none text-wrap break-all whitespace-pre-wrap overflow-hidden grow'>
                            </div>
                        }
                        <div className='shrink-0 ml-2.5' style={{maxWidth: "15px", maxHeight:"15px"}}>
                            <button onClick={sendMessage}><i className="bi bi-send stroke-1 text-charcoal"></i></button>
                        </div>
                    </div>
                </div>
            </div>}
            {type == "empty" && <div className='flex flex-row flex-nowrap items-center min-h-full rounded-r-my border-solid border-1 border-cadet_gray-300'>
                <h2 className='grow font-light text-base text-center'>Select a contact or group chat to get started</h2>
            </div>}
            <AddNewChatModal open={addingChat} setOpen={setAddingChat} chatGroups={chatGroups} chatGroupsUpdater={chatGroupsUpdater} sendWSMessage={sendWSMessage}/>
            <ChatWindowModal shown={false} backdrop={false} delayShow={50}>
                <div className="flex flex-col wrap-none items-center grow">
                    <div className="border border-cadet_gray-300 rounded-my  bg-white">
                        <div className="flex flex-col wrap-none items-end">
                            <button onClick={() => {setAddingChat(false)}} className="w-12 h-12"><Image className="filter-charcoal w-12 h-12" src="/icons/close-small.svg" width={48} height={48} alt="close"></Image></button>
                        </div>
                        <div className="px-24 mb-12">
                            <h1 className="font-medium text-2xl text-center leading-none">Add a Friend</h1>
                            <h2 className={"text-2xl text-center font-bold text-persian_orange mb-14"}>{currUser in userRepo ? userRepo[currUser].username  : ""}?</h2>
                            <div className="flex flex-col wrap-none items-center">
                                <div className="flex flex-row wrap-none items-center">
                                    {/* <Button className="w-32" text="Cancel" colorStyling="Heavy" color="Grayscale" size="Small" onClick={toggleLogoutModal}/> */}
                                    <div className="mr-8">
                                    </div>
                                    {/* <Button className="w-32" text="Logout" colorStyling="Heavy" color="SecondaryAlt" size="Small" onClick={() => setDoLogout(true)} submissionButton={true} submissionText="Logging out..."/> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ChatWindowModal>
        </div>
    );

    

}

export default ChatWindow;