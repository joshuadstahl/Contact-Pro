'use client'
import Image from "next/image";
import Sidebar from '../components/sidebar';
import Navbar from "../components/navbar";
import ChatWindow from '../components/chatWindow';
import { BlankChat, Chat, ChatButtonGroup, GroupChat, Message, User, UserChat, userStatus } from "../components/util/classes";
import { msgStatusEnum } from "../components/messageComponents/msgStatus";
import { useState } from "react";
import { CurrentUserContext } from "../components/context/currentUserContext";

export default function App() {

    let joshstahl = new User({name: "Joshua Stahl", photo:"/jds-profile-smile-square-1mb.jpg", status: userStatus.ONLINE, userID: "joshstahl"})
    let larrysmith = new User({name: "Larry Smith", photo:"", status: userStatus.DO_NOT_DISTURB, userID: "larrysmith"})

    let yesterday = new Date();
    yesterday.setDate(11);
    let msg = new Message({message: "Hello nice to meet you! I hope we can meet up soon. Hi hi hi! I am trying to overlap this message. To see how things look and see if there is any good wrapping on text.", msgID:"01", sender: joshstahl, timestamp: yesterday, status: msgStatusEnum.Read, read:true})
    let msg2 = new Message({message: "Hello nice to meet you! I hope we can meet up soon. Hi hi hi! I am trying to overlap this message. To see how things look and see if there is any good wrapping on text.", msgID:"02", sender: joshstahl, timestamp: yesterday, status: msgStatusEnum.Read, read:true})
    let shortmsg = new Message({message: "Hi!", msgID:"03", sender: larrysmith, timestamp: yesterday, status: msgStatusEnum.Delivered, read: true});
    let shortmsg2 = new Message({message: "Hi!", msgID:"04", sender: larrysmith, timestamp: new Date("5/12/2024"), status: msgStatusEnum.Read, read:true});

    let msgs : Array<Message> = [msg, msg2, shortmsg, shortmsg2];

    let chat1 = new UserChat(
        {
            user: joshstahl,
            messages: [msg, msg2],
            chatID: "21"
    });

    let chat2 = new UserChat(
        {
            user: larrysmith,
            messages: [msg, msg2, shortmsg, shortmsg2],
            chatID: "32"
        }
    )

    let chat3 = new GroupChat(
        {
            name: "Friends Group Chat",
            messages: new Array<Message>,
            photo: "",
            chatID: "14"
        }
    )


//     let chat16 = new Chat(
//         {
//             name: "Larry Smith", 
//             lastMessage:"Woah. Do not disturb me man YEep eep sosiodifodid heieoeesldkfosdklsdkfodksldfkfdks",
//             lastMessageTime: "Yesterday",
//             photo:"/jds-profile-smile-square-1mb.jpg",
//             unreadMessages:0,
//             chatStatus: "do not disturb",
//             chatType: "chat",
//             chatID: '858',
//     });

//   let chat3 = new Chat(
//       {
//           name: "Friends Group Chat", 
//           lastMessage:"James: Yay! So glad for you!",
//           lastMessageTime: "5:55 PM",
//           photo:"/jds-profile-smile-square-1mb.jpg",
//           unreadMessages:1,
//           chatStatus: "online",
//           chatType: "group",
//           chatID: '14',
//   });

//   let chat4 = new Chat(
//       {
//           name: "Work Group Chat", 
//           lastMessage:"Rob: Yes guys we are going to work a few more hours tomorrow.",
//           lastMessageTime: "5:55 PM",
//           photo:"/jds-profile-smile-square-1mb.jpg",
//           unreadMessages: 0,
//           chatStatus: "online",
//           chatType: "group",
//           chatID: '57',
//   });


//   const impChats = [chat1, chat2, chat3, chat4, chat5, chat6, chat7, chat8, chat9, chat10, chat11, chat12, chat13, chat14, chat15, chat16];
    const impChats = [chat1, chat2, chat3];
  let chatgroups = impChats.map((chat: Chat)=> {
      return new ChatButtonGroup({chat: chat, selected: false})
  });

  const [chats, setChats] = useState(chatgroups);
  const [selectedChat, setSelectedChat] = useState(new BlankChat);

  function selectedChatToggler(id:string) {
      chatgroups.forEach(element => {
          element.selected = false;
          if (element.chat.chatID == id) {
              element.selected = true;
              setSelectedChat(element.chat);
          }
      });
      setChats(chatgroups);
  }



  return (
    <div className="top-0 bottom-0 left-0 right-0 absolute flex flex-col p-2.5 h-dvh">
        <CurrentUserContext.Provider value={joshstahl}>
            <Navbar profilePic="/jds-profile-smile-square-1mb.jpg" />
            <div className="flex flex-row gap-2.5 h-full max-h-full overflow-hidden leading-none">  
                <Sidebar chats={chats} selectedChatToggler={selectedChatToggler}/>
                <ChatWindow chat={selectedChat}/>
            </div>
        </CurrentUserContext.Provider>
    </div>
    
  );
}
