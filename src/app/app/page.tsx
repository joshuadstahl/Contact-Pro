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
    let larrysmith = new User({name: "Larry Smith", photo:"/larrysmith.jpg", status: userStatus.DO_NOT_DISTURB, userID: "larrysmith"})
    let happyGuy = new User({name: "Happy Guy", photo: "/happyguy.jpg", status: userStatus.OFFLINE, userID: "happy.guy"})

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

    let chat4 = new UserChat(
        {
            user: happyGuy,
            messages: [msg],
            chatID: "55"
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
  let impChats = [chat1, chat2, chat3, chat4];
  let chatgroups = impChats.map((chat: Chat)=> {
      return new ChatButtonGroup({chat: chat, selected: false})
  });

  const [chatGroups, setChatGroups] = useState(chatgroups);
  const [selectedChat, setSelectedChat] = useState(new BlankChat);
  const [currUser, updateCurrUser] = useState(joshstahl);

  const [oldestUnreadMessageID, setOldestUnreadMessageID] = useState("");

  function keepSyncedCurrUser(u: User) {
    let userid = u.userID;
    let copy = [...chatGroups];
    copy.forEach(x => {
        if (x.chat.constructor == UserChat) {
            let chat2 = x.chat as UserChat;
            if (chat2.otherUser.userID == userid) {
                chat2.otherUser = u;
                chat2.chatStatus = u.status;
                x.chat = chat2;
            } 
        }
    });

    setChatGroups([...copy]);
    updateCurrUser(u);
  }

  function selectedChatToggler(id:string) {
    let copy = [...chatGroups];
    copy.forEach(element => {
        element.selected = false;
        if (element.chat.chatID == id) {
            element.selected = true;
            let temp = element.chat.messages.find((x) => x.read == false);
            setOldestUnreadMessageID(temp !== undefined ? temp.msgID : "");
            element.chat.setAllMessagesRead();
            setSelectedChat(element.chat);
        }
    });
    setChatGroups([...copy]);
  }

  function setUserStatusToOnline(userid:string) {
    let copy = [...chatGroups];
    copy.forEach(x => {
        if (x.chat.constructor == UserChat) {
            let chat2 = x.chat as UserChat;
            if (chat2.otherUser.userID == userid) {
                chat2.otherUser.status = userStatus.ONLINE;
                chat2.chatStatus = userStatus.ONLINE;
                x.chat = chat2;
            } 
        }
    });

    setChatGroups([...copy]);
  }

  function setUserStatusToOffline(userid:string) {
    let copy = [...chatGroups];
    copy.forEach(x => {
        if (x.chat.constructor == UserChat) {
            let chat2 = x.chat as UserChat;
            if (chat2.otherUser.userID == userid) {
                chat2.otherUser.status = userStatus.OFFLINE;
                chat2.chatStatus = userStatus.OFFLINE;
                x.chat = chat2;
            } 
        }
    });

    setChatGroups([...copy]);
  }

  function setUserStatusToDoNotDisturb(userid:string) {
    let copy = [...chatGroups];
    copy.forEach(x => {
        if (x.chat.constructor == UserChat) {
            let chat2 = x.chat as UserChat;
            if (chat2.otherUser.userID == userid) {
                chat2.otherUser.status = userStatus.DO_NOT_DISTURB;
                chat2.chatStatus = userStatus.DO_NOT_DISTURB;
                x.chat = chat2;
            } 
        }
    });

    setChatGroups([...copy]);
  }


  function newMessage() {
    let copy = [...chatGroups];
    let read = false;
    if (selectedChat.chatID == "32") read = true;
    let bob = Math.random() * 10;
    let msg = new Message({message: "This is a new pushed message.", msgID: bob.toString(), sender: larrysmith, timestamp: new Date(), status: msgStatusEnum.Read, read: read})
    copy.forEach(x => {
        if (x.chat.chatID == "32") {
            x.chat.newMessage({msg: msg});
        }
    })
    setChatGroups([...copy]);
  }


  return (
    <div className="top-0 bottom-0 left-0 right-0 absolute flex flex-col p-2.5 h-dvh overflow-hidden">
        <CurrentUserContext.Provider value={currUser}>
            <Navbar profilePic="/jds-profile-smile-square-1mb.jpg" updateCurrUser={keepSyncedCurrUser}/>
            <div className="flex flex-row gap-2.5 h-full max-h-full overflow-hidden leading-none">  
                <Sidebar chats={chatGroups} selectedChatToggler={selectedChatToggler}/>
                <ChatWindow chat={selectedChat} oldestUnreadMessageID={oldestUnreadMessageID}/>
            </div>
            <button onClick={() => setUserStatusToOnline("larrysmith")}>Online</button>
            <button onClick={() => setUserStatusToOffline("larrysmith")}>Offline</button>
            <button onClick={newMessage}>New Message</button>
        </CurrentUserContext.Provider>
    </div>
    
  );
}
