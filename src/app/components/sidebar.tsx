'use client'
import { useState } from 'react';
import ChatButton from './chatButton';
import { ChatButtonGroup } from '../classes/chatButtonGroup';
import Button from "./button";
import Copyright from './copyright';

function Sidebar({chats, selectedChatToggler} : {chats: ChatButtonGroup[], selectedChatToggler:Function}) {
  
    const [selectedButton, setSelectedButton] = useState([true, false]);


    function buttonToggler(index:number)  {
        let temp = [false, false];
        temp[index] = true;
        setSelectedButton(temp);
    }

    let sorted = chats.sort((a, b) => {
        if ((a.chat.lastMessageTime ?? 0) > (b.chat.lastMessageTime ?? 0)) {
            return -1;
        }
        else if ((a.chat.lastMessageTime ?? 0) < (b.chat.lastMessageTime ?? 0)) {
            return 1;
        }
        return a.chat.name.localeCompare(b.chat.name);
    })

    return (
        <div className="basis-1/3 p-2.5
        border-solid border-1 border-cadet_gray-300 rounded-l-my
        bg-ghost_white flex flex-col flex-cols-2 resize-x">

            <h1 className='text-2xl	text-center mt-2.5 shrink-0'>Menu</h1>   
            <div className='flex flex-row flex-rows-1 mt-5 mb-7 gap-5 xl:gap-8 justify-center shrink-0'>
                
                <div className='flex flex-row justify-end'>
                    <Button text="Chats" onClick={() => buttonToggler(0)} selected={selectedButton[0]} colorStyling='Light' color='PrimaryAlt' outline={false}/>
                </div> 
                <div className='flex flex-row justify-start'>
                    <Button text="Friends" onClick={() => buttonToggler(1)} selected={selectedButton[1]} colorStyling='Light' color='PrimaryAlt' outline={false}/>
                </div>
            </div>

            <div className='flex flex-col mb-5 min-h-0 grow'>
                
                {/* These are the headers for the tabs */}
                <div className='flex flex-row flex-nowrap items-center'>
                    <h2 className={"flex text-xl text-left "  + (selectedButton[0] ? "block" : "hidden")}>Chats</h2>
                    <h2 className={"flex text-xl text-left "  + (selectedButton[1] ? "block" : "hidden")}>Friends</h2>
                    <button><i className="bi bi-plus-square stroke-1 text-black ml-3"></i></button>
                </div>

                {/* This is the code for the Chats Tab */}
                <div className={"grid grid-col-1 gap-1 overflow-auto custom_scrollbars " + (selectedButton[0] ? "block" : "hidden")}>  
                    {
                        sorted.map((grp) => {
                            return <ChatButton key={grp.chat.chatID} chat={grp.chat} selected={grp.selected} setSelected={selectedChatToggler}/>
                        })
                    }
                </div>

                {/* This is the code for the Friends Tab */}
                
                <div className={"grid grid-col-1 gap-1 overflow-auto custom_scrollbars " + (selectedButton[1] ? "block" : "hidden")}>
                    
                </div>
                
            </div>
            
            
            <Copyright position="center"/>
        </div>
    );
}

export default Sidebar;