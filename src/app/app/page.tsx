'use client'
import Image from "next/image";
import Sidebar from '../components/sidebar';
import Navbar from "../components/navbar";
import ChatWindow from '../components/chatWindow';
import { BlankChat, Chat, UserChat, GroupChat } from "../classes/chats";
import { ChatButtonGroup } from "../classes/chatButtonGroup";
import { Message } from "../classes/messages";
import { userStatus, User } from "../classes/user";
import { msgStatusEnum } from "../classes/messages";
import { useState, ChangeEvent, useEffect } from "react";
import { CurrentUserContext } from "../components/context/currentUserContext";
import { UserRepositoryContext } from "../components/context/userRepositoryContext";
import { ChatGroupsContext } from "../components/context/chatGroupsContext";
import useSWR from "swr";
import Button from "../components/button";
import FullScreenModal from "../components/fullScreenModal";
import FormSub from "../components/formSub";
import { Logout } from "../components/util/serverFunctions";
import OnboardingModal from "../components/modals/onboardingModal";

export interface userRepository {
    [userID: string]: User
}

export default function App() {

    const fetcher = (input: RequestInfo | URL, init?: RequestInit) => {
        return fetch(input, init).then(res => res.json());
    }

    const blankuser = new User({_id: "0", name: "NA", photo:"/static/noPhoto.png", email:"blank@gmail.com", status: userStatus.OFFLINE, username:"0"});
    const {data, error, isLoading} = useSWR('/api/profile', fetcher); //get the signed in user
    let userInfo = data ?? blankuser;

    const [chatGroups, setChatGroups] = useState(new Array<ChatButtonGroup>); //to keep a list of chats
    const [selectedChat, setSelectedChat] = useState(new BlankChat); //to keep track of the open chat
    const [currUser, setCurrUser] = useState<string>(""); //to keep the object of the current user
    const [loaded, setLoaded] = useState(false); //to keep track if everything is loaded or not
    const [loadedCount, setLoadedCount] = useState(0); //to keep track of how many items are loaded
    const [onboardingComplete, setOnboardingComplete] = useState(true); //if user onboarding is complete
    const [websocket, setWebsocket] = useState<WebSocket>({} as WebSocket); //stores the websocket
    const [userRepo, setUserRepo] = useState<userRepository>({});
    
    const chats = useSWR('/api/chats', fetcher); //get the chats

    //handle the current user data
    if (data !== undefined && currUser == "") {
        setCurrUser(data.user._id);
        setOnboardingComplete(!data.newUser);
        setLoadedCount(loadedCount + 1);
    }

    //handle the chats data
    if (chats.data !== undefined && chatGroups.length == 0) {
        let cg2 = [...chatGroups];
        let userRepo: userRepository = {}; //what is going to update the user repository
        chats.data.chats.forEach((chat: {
            chatID: string,
            name: string,
            chatType: string,
            photo: string,
            messages: Array<Message>,
            members: Array<User>,
            otherUser: User
        }) => {
            //remap the messages to message objects. 
            let theMessages : Array<Message> = chat.messages.map((msg) => {
                return new Message({...msg, _id:msg.msgID.toString()});
            })

            //create the chat button groups (really just the chat groups)
            let chatbgrpNew: ChatButtonGroup;
            if (chat.chatType == "user") {
                chatbgrpNew = new ChatButtonGroup({chat: new UserChat({...chat, messages:theMessages}), selected:false})
            }
            else { //assume it is a group            
                chatbgrpNew = new ChatButtonGroup({chat: new GroupChat({...chat, messages:theMessages}), selected:false})
            }
            cg2.push(chatbgrpNew);

            //import the users from the chat into the users database
            chat.members.map((usr) => {
                //if the user is not yet in the user repository, add it
                if (!(usr._id in userRepo)) {
                    userRepo[usr._id] = new User(usr);
                }
            });
        });
        console.log(cg2);
        setChatGroups(cg2);
        setUserRepo(userRepo);
        setLoadedCount(loadedCount + 1);
    }

    //handle the websocket connection
    useEffect(() => {
        let timeout = 100;
        async function WebSocketConnect() {
            try {
                let resp = await fetch('/api/ws');
                let res = await resp.json();
                let conn = new WebSocket(res.addr + res.hash);
                conn.addEventListener("close", () => {
                    setTimeout(() => {
                        WebSocketConnect();
                        timeout *= 2; //increase the timeout each time
                        console.log(timeout);
                    }, timeout)
                    
                    console.log("WebSocket Closed. Reconnecting...");
                })
                conn.addEventListener("open",  () => {
                    console.log("Connection open!");
                    timeout = 100; //reset the reconnect timeout
                    setWebsocket(conn); //set websocket
                })
                conn.addEventListener("message", async (event) => {
                    let msg =  await JSON.parse(event.data);
                    if (msg.message == "initialized") {
                        //subscribe to updates from the users this user knows
                        Object.keys(userRepo).forEach((key) => {
                            if (key != currUser) {
                                let obj = {
                                    msgType: "userUpdateSubscribe",
                                    data: {
                                        userSubID: key
                                    }
                                }

                                //only send message if the websocket is open (most likely is)
                                if (conn.readyState == WebSocket.OPEN) {
                                    conn.send(JSON.stringify(obj));
                                }
                            } 
                        })
                        //notify online friends and contacts of your current status
                        conn.send(JSON.stringify({
                            msgType: "userUpdate",
                            data: {
                                updateType: "status",
                                status: userRepo[currUser].status
                            }
                        }))
                    }
                    else {
                        WSIncomingMessageHandler(event);
                    }
                })
             }
             catch (err) {
                setTimeout(() => {
                    WebSocketConnect();
                }, 50000) //wait five seconds, then reconnect
                console.log("Error occurred connecting to websocket. Reconnecting in 5 seconds")
             }
        }

        //we want the websocket to be the last thing initialized, hence the loadedCount == 2
        if (loaded == false && loadedCount == 2 && Object.keys(websocket ?? {}).length == 0) {
            WebSocketConnect();
            setLoadedCount(loadedCount + 1);
        }
        
    })
    
    if (loadedCount == 3 && loaded == false) {
        setLoaded(true);
    }
    

  const [oldestUnreadMessageID, setOldestUnreadMessageID] = useState("");

//   function keepSyncedCurrUser(u: User) {
//     let userid = u.username;
//     let copy = [...chatGroups];
//     copy.forEach(x => {
//         if (x.chat.constructor == UserChat) {
//             let chat2 = x.chat as UserChat;
//             if (chat2.otherUser.username == userid) {
//                 chat2.otherUser = u;
//                 chat2.chatStatus = u.status;
//                 x.chat = chat2;
//             }
//         }
//     });

//     setChatGroups([...copy]);
//     if (u.username in userRepo){
//         let copy = {...userRepo}
//         if (u.username in copy) {
//             copy[u.username] = {...u};
//             setUserRepo(copy);
//         }
//     }
//   }

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

//   function newMessage() {
//     let copy = [...chatGroups];
//     let read = false;
//     if (selectedChat.chatID == "32") read = true;
//     let bob = Math.random() * 10;
//     let msg = new Message({message: "This is a new pushed message.", _id: bob.toString(), sender: larrysmith, timestamp: new Date(), status: msgStatusEnum.Read, read: read})
//     copy.forEach(x => {
//         if (x.chat.chatID == "32") {
//             x.chat.newMessage({msg: msg});
//         }
//     })
//     setChatGroups([...copy]);
//   }

  function addNewMessage(msg: Message, chatID: string) {
    console.log("adding new message");
    let copy = [...chatGroups];
    console.log(chatID);
    copy.forEach((grp) => {
        console.log(grp.chat.chatID);
        if (grp.chat.chatID == chatID) {
            grp.chat.newMessage({msg});
            console.log("adding new message v2");
        }
    })
    setChatGroups(copy);
  }

  function changeName() {
    let copy = {...userRepo};
    if ("66d3604224b6f40eaafb0b94" in copy) {
        (copy["66d3604224b6f40eaafb0b94"] as User).name = "Harry Smith Bungaloo";
        setUserRepo(copy);
    }
  }

  function changeStatus(userID: string, status: userStatus|Number) {
    let copy = {...userRepo};
    if (userID in copy) {
        copy[userID].status = (status as userStatus);
        setUserRepo(copy);
    }
  }

  function sendWSMessage(message: object|string) {
    if (websocket.readyState == WebSocket.OPEN) {
        websocket.send(JSON.stringify(message));
        console.log("sent!");
    }
    else {
        console.log("no sent");
    }
  }

  async function WSIncomingMessageHandler(event: MessageEvent) {
    let body;
    try {
        body = await JSON.parse(event.data);
    }
    catch(err) {
        return;
    }

    if (body.msgType == "userUpdate") {
        if (body.data !== undefined && body.data.updateType !== undefined) {
            if (body.data.updateType == "status") {
                console.log("Changing status for ", body.data.userID);
                changeStatus(body.data.userID ?? "", body.data.status ?? 0);
            }
        }
    }
    else if (body.msgType == "message") {
        if (body.data !== undefined) {
            if (body.data._id !== undefined && body.data.message !== undefined && body.data.sender !== undefined && 
                body.data.timestamp !== undefined && body.data.read !== undefined && body.data.chatID !== undefined) {

                addNewMessage(new Message({message: body.data.message, _id: body.data._id, sender: userRepo[body.data.sender], timestamp: new Date(body.data.timestamp), status: body.data.status, read:body.data.read}), body.data.chatID)
            }
        }
    }
    else if (body.msgType == "messageUpdate") {

    }
    else if (body.msgType == "messageCreated") {

        //the idea is to update the created message to have the new id from the server.
        if (body.data !== undefined && body.data.oldid !== undefined && body.data.newid !== undefined) {
            let copy = [...chatGroups];
            copy.forEach((grp) => {
                grp.chat.messages.forEach(msg => {
                    if (msg.msgID == body.data.oldid) {
                        msg.msgID = body.data.newid ?? "";
                    }
                });
            })
            setChatGroups(copy); //update the chat groups
        }
        
    }
    else if (body.msgType == "messageCreationFailed") {
        if (body.data !== undefined) {

        }
    }

    
  }

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  function toggleLogoutModal() {
    setLogoutModalOpen(!logoutModalOpen);
  }

  const [doLogout, setDoLogout] = useState(false);
  
  return (

    <div>
        {doLogout && <FormSub action={async () => {await Logout()}}/>}
        <OnboardingModal currUser={currUser} userRepo={userRepo} setUserRepo={setUserRepo} pageLoaded={loaded} onboardingComplete={onboardingComplete} setOnboardingComplete={setOnboardingComplete}/>
        <FullScreenModal shown={logoutModalOpen} backdrop={false} delayShow={50}>
            <div className="flex flex-col wrap-none items-center grow">
                <div className="border border-cadet_gray-300 rounded-my  bg-white">
                    <div className="flex flex-col wrap-none items-end">
                        <button onClick={toggleLogoutModal} className="w-12 h-12"><Image className="filter-charcoal w-12 h-12" src="/icons/close-small.svg" width={48} height={48} alt="close"></Image></button>
                    </div>
                    <div className="px-24 mb-12">
                        <h1 className="font-medium text-2xl text-center text-persian_green leading-none">Are you sure you want to logout,</h1>
                        <h2 className={"text-2xl text-center font-bold text-persian_orange mb-14"}>{currUser}?</h2>
                        <div className="flex flex-col wrap-none items-center">
                            <div className="flex flex-row wrap-none items-center">
                                <Button className="w-32" text="Cancel" colorStyling="Heavy" color="Grayscale" size="Small" onClick={toggleLogoutModal}/>
                                <div className="mr-8">
                                </div>
                                <Button className="w-32" text="Logout" colorStyling="Heavy" color="SecondaryAlt" size="Small" onClick={() => setDoLogout(true)} submissionButton={true} submissionText="Logging out..."/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FullScreenModal>
        <div className={"top-0 bottom-0 left-0 right-0 absolute flex flex-col p-2.5 h-dvh overflow-hidden " + (!onboardingComplete ? "pointer-events-none" : "")}>
            {loaded && 
            <UserRepositoryContext.Provider value={userRepo}>
                <CurrentUserContext.Provider value={currUser}>
                    <Navbar sendWSMessage={sendWSMessage} setStatus={changeStatus} updateUserRepo={setUserRepo} toggleLogoutModal={toggleLogoutModal}/>
                    <div className="flex flex-row gap-2.5 h-full max-h-full overflow-hidden leading-none">
                        <Sidebar chats={chatGroups} selectedChatToggler={selectedChatToggler}/>
                        <ChatWindow chatGroups={chatGroups} setChatGroups={setChatGroups} addNewMessage={addNewMessage} sendWSMessage={sendWSMessage} chat={selectedChat} oldestUnreadMessageID={oldestUnreadMessageID} userRepo={userRepo}/>
                    </div>
                    {/* <button onClick={() => setUserStatusToOnline("larrysmith")}>Online</button> */}
                    <button onClick={() => changeName()}>Change</button>
                    {/* <button onClick={newMessage}>New Message</button> */}
                </CurrentUserContext.Provider>
            </UserRepositoryContext.Provider>
            }
        </div>
        {!loaded && <div>Loading...</div>}
    </div>
    
  );
}
