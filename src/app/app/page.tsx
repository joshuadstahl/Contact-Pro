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
import { useState, ChangeEvent, useEffect, useRef, useCallback } from "react";
import { CurrentUserContext } from "../components/context/currentUserContext";
import { UserRepositoryContext } from "../components/context/userRepositoryContext";
import { ChatGroupsContext } from "../components/context/chatGroupsContext";
import useSWR from "swr";
import Button from "../components/button";
import FullScreenModal from "../components/modals/fullScreenModal";
import FormSub from "../components/formSub";
import { Logout } from "../components/util/serverFunctions";
import OnboardingModal from "../components/modals/onboardingModal";

export interface userRepository {
    [userID: string]: User
}

export interface chatRepository {
    [chatID: string] : GroupChat | UserChat
}

export default function App() {

    const fetcher = (input: RequestInfo | URL, init?: RequestInit) => {
        return fetch(input, init).then(res => res.json());
    }

    const blankuser = new User({_id: "0", name: "NA", photo:"/static/noPhoto.png", email:"blank@gmail.com", status: userStatus.OFFLINE, username:"0"});
    const {data, error, isLoading} = useSWR('/api/profile', fetcher); //get the signed in user
    let userInfo = data ?? blankuser;

    const [chatGroups, setChatGroups] = useState<chatRepository>({}); //to keep a list of chats
    const [selectedChatID, setSelectedChatID] = useState<string>(""); //to keep track of the id of the open chat
    const [currUser, setCurrUser] = useState<string>(""); //to keep the object of the current user
    const [loaded, setLoaded] = useState(false); //to keep track if everything is loaded or not
    const [loadedCount, setLoadedCount] = useState(0); //to keep track of how many items are loaded
    const [onboardingComplete, setOnboardingComplete] = useState(true); //if user onboarding is complete
    const [websocket, setWebsocket] = useState<WebSocket>({} as WebSocket); //stores the websocket
    const [userRepo, setUserRepo] = useState<userRepository>({});
    const [oldestUnreadMessageID, setOldestUnreadMessageID] = useState(""); //keep track of the oldest unread message (if such thing)
    const [webSocketListener, setWebSocketListener] = useState(false); //keep track if there is a websocket listener already.
    const refSelectedChatID = useRef(""); //use Ref hook so webhook message event handler can access an updated version of selectedChatID.
    const refWebSocketListener = useRef(false); //use Ref hook so the code handling the WS connection can keep notified of the websocket event handler status.

    const chats = useSWR('/api/chats', fetcher); //get the chats

    /*************************  FUNCTIONS  **************************/
    const sendWSMessage = useCallback(function sendWSMessage(message: object|string) {
        if (websocket.readyState == WebSocket.OPEN) {
            websocket.send(JSON.stringify(message));
            console.log("sent!");
        }
        else {
            console.log("no sent");
        }
    }, [websocket]);

    const selectedChatToggler = useCallback(function selectedChatToggler(id:string) {
        if (id in chatGroups) {
            let temp = chatGroups[id].messages.find((x) => x.read == false);
            setOldestUnreadMessageID(temp !== undefined ? temp.msgID : "");
            setSelectedChatID(id);
            refSelectedChatID.current = id; //update the useRef version of the selected Chat ID.
            let copy = {...chatGroups};
            copy[id].setAllMessagesRead(sendWSMessage, currUser);
            setChatGroups({...copy});
        }
    }, [chatGroups, setChatGroups, setSelectedChatID, sendWSMessage, setOldestUnreadMessageID, refSelectedChatID, currUser])

    const addNewMessage = useCallback(function addNewMessage(msg: Message, chatID: string) {
        let copy = {...chatGroups};
        Object.values(copy).forEach((grp) => {
            if (grp.chatID == chatID) {
                grp.newMessage({msg});
                if (refSelectedChatID.current == chatID) {
                    //if the window has focus, then set all the messages to be read.
                    if (document.hasFocus()) {
                        console.log("All messages read!");
                        grp.setAllMessagesRead(sendWSMessage, currUser);
                    }
                    else {
                        //set an one-time event listener to trigger
                        //the messages being read on focus, only
                        //if the event listener hasn't already been set up
                        if (grp.unreadMessages == 1) {
                            window.addEventListener("focus", () => {
                                selectedChatToggler(chatID);
                            }, {once: true});
                        }
                        //if the new message is from a different user,
                        //turn on the new message flag        
                        if (msg.sender._id != currUser) {
                            let temp = grp.messages.find((x) => x.read == false);
                            setOldestUnreadMessageID(temp !== undefined ? temp.msgID : "");
                        }
                        
                    }
    
                    //if the sender of the most recent message is the signed-in user, then
                    //really all the messages should be read and there should be no "new message" 
                    //flag.
                    if (msg.sender._id == currUser) {
                        setOldestUnreadMessageID("");
                    }
                              
                }
            }
        })
        setChatGroups(copy);
    }, [chatGroups, selectedChatToggler, setOldestUnreadMessageID, setChatGroups, currUser, sendWSMessage])

    const changeStatus = useCallback(function changeStatus(userID: string, status: userStatus|Number) {
        let copy = {...userRepo};
        if (userID in copy) {
            copy[userID].status = (status as userStatus);
            setUserRepo(copy);
        }
    }, [userRepo, setUserRepo])
    
    const WSIncomingMessageHandler = useCallback(
        function WSIncomingMessageHandler(event: MessageEvent) {
          let body;
          try {
              body = JSON.parse(event.data);
          }
          catch(err) {
              return;
          }
      
          if (body.msgType == "userUpdate") {
              if (body.data !== undefined && body.data.updateType !== undefined) {
                  if (body.data.updateType == "status") {
                      changeStatus(body.data.userID ?? "", body.data.status ?? 0);
                  }
              }
          }
          else if (body.msgType == "message") {
              if (body.data !== undefined) {
                  let data = body.data;
                  if (data._id !== undefined && data.message !== undefined && data.sender !== undefined && 
                      data.timestamp !== undefined && data.read !== undefined && data.chatID !== undefined) {
      
                      let read = data.read;
                      if (selectedChatID == data.chatID && document.hasFocus()) {
                          read = true;
                      }
                      
                      addNewMessage(new Message({message: data.message, _id: data._id, sender: userRepo[data.sender], timestamp: new Date(data.timestamp), status: data.status, read:read, received: true}), data.chatID);
                      sendWSMessage({msgType: "messageUpdate", data: {_id: data._id, received: true, read: read}});
                  }
              }
          }
          else if (body.msgType == "messageUpdate") {
              if (body.data !== undefined && body.data._id !== undefined && body.data.status !== undefined) {
                  let copy = {...chatGroups};
                  for (let i = 0; i < Object.values(copy).length; i++) {
                      let grp = Object.values(copy)[i];
                      let doBreak = false;
                      for (let j = 0; j < grp.messages.length; j++) {
                          if (grp.messages[j].msgID == body.data._id) {
                              grp.messages[j].status = body.data.status;
                              doBreak = true;
                              break;
                          }
                      }
                      if (doBreak) break;
                  }
                  setChatGroups(copy); //update the chat groups
              }
          }
          else if (body.msgType == "messageCreated") {
      
              //the idea is to update the created message to have the new id from the server.
              if (body.data !== undefined && body.data.oldid !== undefined && body.data.newid !== undefined) {
                  let copy = {...chatGroups};
                  Object.values(copy).forEach((grp) => {
                      grp.messages.forEach(msg => {
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
                  if (body.data.id != undefined) {
                      let copy = {...chatGroups};
                      Object.values(copy).forEach((grp) => {
                          grp.messages.forEach(msg => {
                              if (msg.msgID == body.data.id) {
                                  
                              }
                          });
                      })
                      setChatGroups(copy); //update the chat groups
                  }
              }
          }
      
          
    }, [changeStatus, addNewMessage, sendWSMessage, selectedChatID, chatGroups, setChatGroups, userRepo])


    /*************************  PAGE LOGIC  **************************/

    //handle the current user data
    if (data !== undefined && currUser == "") {
        setCurrUser(data.user._id);
        setOnboardingComplete(!data.newUser);
        setLoadedCount(loadedCount + 1);
    }

    //handle the chats data
    if (chats.data !== undefined && Object.keys(chatGroups).length == 0) {
        let cg2 = {...chatGroups};
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
            //remap the messages to message objects. (and send delivered notifications if necessary)
            let theMessages : Array<Message> = chat.messages.map((msg) => {               
                return new Message({...msg, _id:msg.msgID.toString()});
            })

            //create the chat button groups (really just the chat groups)
            let newChat: Chat;
            if (chat.chatType == "user") {
                newChat = new UserChat({...chat, messages:theMessages});
            }
            else { //assume it is a group            
                newChat = new GroupChat({...chat, messages:theMessages});
            }
            cg2[newChat.chatID] = newChat;

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

    //handle the chats again after the websocket has been connected to 
    //send delivered notifications to the websocket server.
    //Wait for the websocket to be open and a listener registered.
    if (loadedCount == 3 && websocket.readyState == WebSocket.OPEN && webSocketListener) {
        let copy = {...chatGroups};
        Object.keys(copy).forEach(key => {
            let group = copy[key];
            
            group.messages.forEach((msg) => {
                if (msg.received == false) {
                    msg.received = true;
                    sendWSMessage({msgType: "messageUpdate", data: {_id: msg.msgID, received: true}});
                }
            })
            
        });

        setLoadedCount(4);
        setChatGroups(copy);
        
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
                        WebSocketConnect(); //try to reconnect
                        timeout *= 2; //increase the timeout each time
                        console.log(timeout);
                    }, timeout)
                    
                    //if there is a current websocket [event] listener
                    //then set that there isn't one so it can be recreated
                    //when a new websocket connection is created.
                    if (refWebSocketListener.current == true) {
                        setWebSocketListener(false);
                        refWebSocketListener.current = false;
                    }
                    
                    console.log("WebSocket Closed. Reconnecting...");
                })
                conn.addEventListener("open",  () => {
                    console.log("Connection open!");
                    timeout = 100; //reset the reconnect timeout
                })
                conn.addEventListener("message", async (event) => {
                    let msg =  await JSON.parse(event.data);

                    if (msg.message == "initialized") {
                        //set websocket now that the websocket server says it is initialized (this is important because the 
                        //websocket server will ignore everything until it is finished processing the authentication)
                        setWebsocket(conn);

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
                        
                    }
                })
             }
             catch (err) {
                setTimeout(() => {
                    WebSocketConnect(); //try to reconnect
                }, 50000) //wait five seconds, then reconnect

                //if there is a current websocket [event] listener
                //then set that there isn't one so it can be recreated
                //when a new websocket connection is created.
                if (refWebSocketListener.current == true) {
                    setWebSocketListener(false);
                    refWebSocketListener.current = false;
                }
                console.log("Error occurred connecting to websocket. Reconnecting in 5 seconds")
             }
        }

        //we want the websocket to be the second thing initialized, hence the loadedCount >= 1
        if (loaded == false && loadedCount == 2 && Object.keys(websocket ?? {}).length == 0) {
            WebSocketConnect();
            setLoadedCount(3);
        }
        
    }, [loaded, loadedCount, setLoadedCount, websocket, setWebsocket, selectedChatID, 
        userRepo, currUser, WSIncomingMessageHandler, setWebSocketListener])
    
    if (loadedCount == 4 && loaded == false) {
        setLoaded(true);
    }
    
    //add keyboard shortcut event listener
    useEffect(() => {

        function keyboardShortcuts(event: KeyboardEvent): any {
            //if the key is escape and there is a selected chat, then set remove the "new messages" banner.
            if (event.key == "Escape" && selectedChatID != "") {
                setOldestUnreadMessageID("");
            }
        }

        //only set it once, when the page is loaded.
        if (loaded == true) {
            window.addEventListener("keydown", keyboardShortcuts);
        }
        
    }, [loaded, selectedChatID])

  function changeName() {
    let copy = {...userRepo};
    if ("66d3604224b6f40eaafb0b94" in copy) {
        (copy["66d3604224b6f40eaafb0b94"] as User).name = "Harry Smith Bungaloo";
        setUserRepo(copy);
    }
  }  

  if (websocket.readyState == WebSocket.OPEN && websocket !== null && webSocketListener == false) {
    console.log("wsOpen!");
    setWebSocketListener(true);
    refWebSocketListener.current = true;
    websocket.removeEventListener("message", WSIncomingMessageHandler);
    websocket.addEventListener("message", WSIncomingMessageHandler);
  }

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  function toggleLogoutModal() {
    setLogoutModalOpen(!logoutModalOpen);
  }

  const [doLogout, setDoLogout] = useState(false);

  //console.log("Current state from root of App of selectedChatID ", selectedChatID);
  
  return (

    <div>
        {doLogout && <FormSub action={async () => {
            websocket.close(); //close the websocket on logout (for some reason it doesn't immeditately get closed)
            await Logout()
        }}/>}
        <OnboardingModal currUser={currUser} userRepo={userRepo} setUserRepo={setUserRepo} pageLoaded={loaded} onboardingComplete={onboardingComplete} setOnboardingComplete={setOnboardingComplete}/>
        <FullScreenModal shown={logoutModalOpen} backdrop={false} delayShow={50}>
            <div className="flex flex-col wrap-none items-center grow">
                <div className="border border-cadet_gray-300 rounded-my  bg-white">
                    <div className="flex flex-col wrap-none items-end">
                        <button onClick={toggleLogoutModal} className="w-12 h-12"><Image className="filter-charcoal w-12 h-12" src="/icons/close-small.svg" width={48} height={48} alt="close"></Image></button>
                    </div>
                    <div className="px-24 mb-12">
                        <h1 className="font-medium text-2xl text-center text-persian_green leading-none">Are you sure you want to logout,</h1>
                        <h2 className={"text-2xl text-center font-bold text-persian_orange mb-14"}>{currUser in userRepo ? userRepo[currUser].username  : ""}?</h2>
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
                        <Sidebar chats={chatGroups} selectedChatID={selectedChatID} selectedChatToggler={selectedChatToggler}/>
                        <ChatWindow chatGroups={chatGroups} setChatGroups={setChatGroups} addNewMessage={addNewMessage} sendWSMessage={sendWSMessage} chatID={selectedChatID} userRepo={userRepo} oldestUnreadMessageID={oldestUnreadMessageID} setOldestUnreadMessageID={setOldestUnreadMessageID}/>
                    </div>
                    {/* <button onClick={() => setUserStatusToOnline("larrysmith")}>Online</button> */}
                    {/* <button onClick={() => changeName()}>Change</button> */}
                    {/* <button onClick={newMessage}>New Message</button> */}
                </CurrentUserContext.Provider>
            </UserRepositoryContext.Provider>
            }
        </div>
        {!loaded && <div>Loading...</div>}
    </div>
    
  );
}
