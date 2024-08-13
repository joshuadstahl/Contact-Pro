'use client'

import { Dispatch, SetStateAction, useState } from 'react';
import ChatButton from './chatButton';
import { Chat, ChatButtonGroup, GroupChat, UserChat } from './util/classes';
import Button from "./button";
import Copyright from './copyright';

function Sidebar({chats, selectedChatToggler} : {chats: ChatButtonGroup[], selectedChatToggler:Function}) {
  
    const [selectedButton, setSelectedButton] = useState([true, false]);


    function buttonToggler(index:number)  {
        let temp = [false, false];
        temp[index] = true;
        setSelectedButton(temp);
    }

    let peoplechats = chats.filter((grp: ChatButtonGroup) => {
        return grp.chat.constructor == UserChat;
    });
    let groupchats = chats.filter((grp: ChatButtonGroup) => {
        return grp.chat.constructor == GroupChat;
    })

    return (
        <div className="basis-1/3 p-2.5
        border-solid border-1 border-cadet_gray-300 rounded-l-my
        bg-ghost_white flex flex-col flex-cols-2 resize-x">

            <div className='flex flex-row flex-rows-1 my-4 gap-3.5 justify-center'>   
                <div className='flex flex-row justify-end'>
                    <Button text="Chats" onClick={() => buttonToggler(0)} selected={selectedButton[0]}/>
                </div> 
                <div className='flex flex-row justify-start'>
                    <Button text="Group Chats" onClick={() => buttonToggler(1)} selected={selectedButton[1]}/>
                </div>
            </div>

            <div className='flex flex-col mb-5 min-h-0 grow'>
                
                {/* These are the headers for the tabs */}
                <h2 className={"flex text-xl text-left "  + (selectedButton[0] ? "block" : "hidden")}>Chats</h2>
                <h2 className={"flex text-xl text-left "  + (selectedButton[1] ? "block" : "hidden")}>Group Chats</h2>

                {/* This is the code for the Chats Tab */}
                <div className={"grid grid-col-1 gap-1 overflow-auto custom_scrollbars " + (selectedButton[0] ? "block" : "hidden")}>  
                    {
                        peoplechats.map((grp) => {
                            return <ChatButton key={grp.chat.chatID} chat={grp.chat} selected={grp.selected} setSelected={selectedChatToggler}/>
                        })
                    }
                </div>

                {/* This is the code for the Group Chats Tab */}
                
                <div className={"grid grid-col-1 gap-1 overflow-auto custom_scrollbars " + (selectedButton[1] ? "block" : "hidden")}>
                    {
                        groupchats.map((grp) => {
                            return <ChatButton key={grp.chat.chatID} chat={grp.chat} selected={grp.selected} setSelected={selectedChatToggler}/>
                        })
                    }
                </div>
                
            </div>
            
            
            <Copyright position="center"/>
        </div>
    );
}

export default Sidebar;