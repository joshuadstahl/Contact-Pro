'use client'
import Image from "next/image";
import Sidebar from '../components/sidebar';
import Navbar from "../components/navbar";
import ChatWindow from '../components/chatWindow';
import { BlankChat, Chat, ChatButtonGroup, GroupChat, Message, User, UserChat, userStatus } from "../components/util/classes";
import { msgStatusEnum } from "../components/messageComponents/msgStatus";
import { useState, ChangeEvent } from "react";
import { CurrentUserContext } from "../components/context/currentUserContext";
import { getSession } from "../components/util/serverFunctions";
import useSWR from "swr";
import TextInput from "../components/textInput";
import Button from "../components/button";
import { generateSlug, RandomWordOptions } from "random-word-slugs";
import { randomInt } from "crypto";
import useDelayedClassToggler from "../hooks/useDelayedClassToggler";
import FullScreenModal from "../components/fullScreenModal";

export default function App() {

    let joshstahl = new User({name: "Joshua Stahl", photo:"/jds-profile-smile-square-1mb.jpg", email:"joshuadstahl@gmail.com", status: userStatus.ONLINE, username: "joshstahl"})
    let larrysmith = new User({name: "Larry Smith", photo:"/larrysmith.jpg", email:"larrysmith@gmail.com", status: userStatus.DO_NOT_DISTURB, username: "larrysmith"})
    let happyGuy = new User({name: "Happy Guy", photo: "/happyguy.jpg", email:"happyguy@gmail.com", status: userStatus.OFFLINE, username: "happy.guy"})

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


//   const impChats = [chat1, chat2, chat3, chat4, chat5, chat6, chat7, chat8, chat9, chat10, chat11, chat12, chat13, chat14, chat15, chat16];
    let impChats = [chat1, chat2, chat3, chat4];
    let chatgroups = impChats.map((chat: Chat)=> {
        return new ChatButtonGroup({chat: chat, selected: false})
    });

    const fetcher = (input: RequestInfo | URL, init?: RequestInit) => {
        return fetch(input, init).then(res => res.json());
    }
    const blankuser = new User({name: "NA", photo:"photo", email:"blank@gmail.com", status: userStatus.OFFLINE, username:"0"});
    const {data, error, isLoading} = useSWR('/api/profile', fetcher);
    let userInfo = data ?? blankuser;

    const [chatGroups, setChatGroups] = useState(chatgroups);
    const [selectedChat, setSelectedChat] = useState(new BlankChat);
    const [currUser, setCurrUser] = useState<User>(blankuser);
    const [loaded, setLoaded] = useState(false);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    

    if (data !== undefined && currUser.username == "0") {
        setCurrUser(new User(data.user));
        setLoaded(true);
        // setOnboardingComplete(!data.newUser);
    }

  const [oldestUnreadMessageID, setOldestUnreadMessageID] = useState("");

  function keepSyncedCurrUser(u: User) {
    let userid = u.username;
    let copy = [...chatGroups];
    copy.forEach(x => {
        if (x.chat.constructor == UserChat) {
            let chat2 = x.chat as UserChat;
            if (chat2.otherUser.username == userid) {
                chat2.otherUser = u;
                chat2.chatStatus = u.status;
                x.chat = chat2;
            } 
        }
    });

    setChatGroups([...copy]);
    setCurrUser(u);
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
            if (chat2.otherUser.username == userid) {
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
            if (chat2.otherUser.username == userid) {
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
            if (chat2.otherUser.username == userid) {
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

  const [newUsername, setNewUsername] = useState(randomUsername());
  const [usernameTaken, setUsernameTaken] = useState(false);
  function randomUsername(): string {
    const options: RandomWordOptions<2> = {
        format: "camel",
        partsOfSpeech: ["adjective", "noun"],
        categories: {
            adjective: ["color", "appearance"],
            noun: ["animals", "food"]
        }
    }
    let slug = generateSlug(2, options); //generate the two words together
    slug = slug.charAt(0).toUpperCase() + slug.slice(1); //uppercase the first letter
    const num = Math.round(Math.random() * 1000); //generate the random 3 numbers at the end
    let num2 = num.toString().padStart(3, "0"); //pad the random 3 numbers with 0s

    return slug + num2;
  }
  function newRandomUsername() {
    setNewUsername(randomUsername());
  }

  async function chooseUsername() {
    let body = {username: newUsername};
    try {
        let res = await fetch("/api/profile/username", {method: "PUT", body: JSON.stringify(body)});

        if (res.ok) {
            let copy = {...currUser};
            copy = new User(copy);
            copy.username = newUsername;
            setCurrUser(copy);
            setOnboardingComplete(true);
        }
        else {
            setUsernameTaken(true);
        }
        
    }
    catch {
        setUsernameTaken(true);
    }
    
  }

  function chooseUsernameLater() {
    setOnboardingComplete(true);
  }

  function newUsernameChanged(event: ChangeEvent<HTMLInputElement>) {
    setUsernameTaken(false);
    setNewUsername(event.target.value ?? "");
  }

  return (

    <div>
        <FullScreenModal shown={loaded && !onboardingComplete}>
            <div className="flex flex-col wrap-none items-center grow">
                <div className="border border-cadet_gray-300 rounded-my px-28 py-10 bg-white">
                    <h1 className="font-medium text-3xl text-center text-persian_green leading-none">Welcome aboard,</h1>
                    <h2 className={"text-3xl text-center font-bold text-persian_green mb-14"}>{currUser.name}!</h2>
                    <div className="flex flex-col wrap-none items-center mb-14">
                        <h2 className="text-center text-2xl text-moss_green-500">Let&apos;s choose a username.</h2>
                        <p className="text-center text-sm text-charcoal">This is what you&apos;ll be known by in Contact Pro</p>
                    </div>
                    <div className="flex flex-col wrap-none items-center">
                        
                        <div className="flex flex-row wrap-none items-center">

                            <div className="relative ">
                                {/* <TextInput id="newUsername" value={newUsername} placeholder="New username here" label="Username" changedCallback={newUsernameChanged}/> */}
                                <label className="absolute w-full " htmlFor="newUsername">
                                    <div className="flex flex-row wrap-none w-full items-center">
                                        <p className="text-light text-charcoal">Username</p>
                                        {usernameTaken && <div className="flex flex-col wrap-none grow">
                                            <p className="self-end text-sm text-coral-800">Username already taken</p>
                                        </div>}
                                    </div>
                                </label>
                                <input onChange={newUsernameChanged} value={newUsername} id={"newUsername"} className="text-sm outline-none p-2.5 border border-solid border-cadet_gray-300 rounded-my mt-5 w-64" type="text" placeholder={"New username here"} />
                            </div>
                            <div className="mr-2.5">
                            </div>
                            <Button className="mt-5" text="Random Username" colorStyling="Light" color="Grayscale" size="Small" onClick={newRandomUsername} outline={true}/>
                        </div>
                        <div className="mt-2.5">
                            <p className="text-sm text-cadet_gray-600 text-center">Username can be changed later in account settings</p>
                        </div>

                        <div className="flex flex-row wrap-none items-center mt-14">
                            <Button className="w-32" text="Later" colorStyling="Heavy" color="Grayscale" size="Small" onClick={chooseUsernameLater}/>
                            <div className="mr-8">
                            </div>
                            <Button className="w-32" text="Choose" colorStyling="Heavy" color="Primary" size="Small" onClick={chooseUsername}/>
                        </div>
                    </div>
                </div>
            </div>
        </FullScreenModal>
        <div className={"top-0 bottom-0 left-0 right-0 absolute flex flex-col p-2.5 h-dvh overflow-hidden " + (!onboardingComplete ? "pointer-events-none" : "")}>
            {loaded && <CurrentUserContext.Provider value={currUser}>
                <Navbar profilePic="/jds-profile-smile-square-1mb.jpg" updateCurrUser={keepSyncedCurrUser}/>
                <div className="flex flex-row gap-2.5 h-full max-h-full overflow-hidden leading-none">
                    <Sidebar chats={chatGroups} selectedChatToggler={selectedChatToggler}/>
                    <ChatWindow chat={selectedChat} oldestUnreadMessageID={oldestUnreadMessageID}/>
                </div>
                <button onClick={() => setUserStatusToOnline("larrysmith")}>Online</button>
                <button onClick={() => setUserStatusToOffline("larrysmith")}>Offline</button>
                <button onClick={newMessage}>New Message</button>
            </CurrentUserContext.Provider>}
        </div>
        {!loaded && <div>Loading...</div>}
    </div>
    
  );
}
