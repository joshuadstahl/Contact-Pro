'use client'
import { useContext, useState } from 'react';
import ChatButton from './chatButton';
import { ChatButtonGroup } from '../classes/chatButtonGroup';
import Button from "./button";
import NotifyButton from './NotifyButton';
import Copyright from './copyright';
import { chatRepository, friendRequestRepository } from '../app/page';
import { Chat, GroupChat, UserChat } from '../classes/chats';
import FriendRequestTile from './friendRequestTile';
import { UserRepositoryContext } from './context/userRepositoryContext';
import { FriendRequest } from '../classes/friendRequest';
import { CurrentUserContext } from './context/currentUserContext';


function Sidebar({chats, setChats, selectedChatID, selectedChatToggler, addingChat, setAddingChat, addingFriendRequest, setAddingFriendRequest, friendRequests, setFriendRequests, friends, setFriends} : {chats: chatRepository, setChats: (chats: chatRepository) => void, selectedChatID: string, selectedChatToggler: (chatID: string) => void, addingChat:boolean, setAddingChat:Function, addingFriendRequest: boolean, setAddingFriendRequest: (adding: boolean) => void, friendRequests: friendRequestRepository, setFriendRequests: (friendRequests: friendRequestRepository) => void, friends: Array<string>, setFriends: (friends: Array<string>) => void}) {

    const [selectedButton, setSelectedButton] = useState([true, false]);
    const [friendsSelectedButton, setFriendsSelectedButton] = useState([true, false]);
    const [friendRequestStatus, setFriendRequestStatus] = useState<friendRequestSubmitting>({});
    const currentUser = useContext(CurrentUserContext);
    const userRepo = useContext(UserRepositoryContext);

    interface friendRequestSubmitting {
        [reqID: string] : boolean
    }

    interface userChatRepository {
        [chatID: string] : UserChat
    }

    interface groupChatRepository {
        [chatID: string] : GroupChat
    }

    function buttonToggler(index:number)  {
        let temp = [false, false];
        temp[index] = true;
        setSelectedButton(temp);
    }

    function friendsButtonToggler(index:number) {
        let temp = [false, false];
        temp[index] = true;
        setFriendsSelectedButton(temp);
    }

    function changeFriendRequestStatus(id: string, status: boolean) {
        let copy = {...friendRequestStatus};
        copy[id] = status;
        setFriendRequestStatus(copy);
    }

    async function doFriendRequestAction(id: string, action: string) {
        try {
            changeFriendRequestStatus(id, true);
            let res = await fetch("/api/friends/request", {method: "PATCH", body: JSON.stringify({id: id, action: action})});
            

            if (res.ok) {
                let body = await res.json();
                let friendRequest = friendRequests[id];
                if (action == "accept") {
                    let chatsCopy = {...chats};
                    let friendsCopy = [...friends];
                    let data = await (await fetch("api/chat/?id=" + body.data.newChatID)).json();
                    chatsCopy[body.data.newChatID] = new UserChat({...data, _id: body.data.newChatID});
                    friendsCopy.push(friendRequest.sender._id);
                    setChats(chatsCopy);
                    setFriends(friendsCopy);
                    console.log(chatsCopy);
                }
                else {
                    
                }
    
                //remove the friend request.
                let copy = {...friendRequests};
                delete copy[id];
                setFriendRequests(copy);
            
                changeFriendRequestStatus(id, false);
                
            }
            else {
                changeFriendRequestStatus(id, false);
            }
            
        }
        catch (error) {
            console.log("Error on " + action + "ing" + " friend request", error);
            changeFriendRequestStatus(id, false);
        }
    }

    async function acceptFriendRequest(id: string) {
        doFriendRequestAction(id, "accept");
    }

    async function rejectFriendRequest(id: string) {
        doFriendRequestAction(id, "reject");
    }

    async function cancelPendingFriendRequest(id: string) {
        doFriendRequestAction(id, "cancel");
    }

    //get out all chat elements in object and put them into an array for sorting.
    let toFilterArray = new Array<[string: String, chat: UserChat | GroupChat]>;
    for (var i in chats) {
        toFilterArray.push([i, chats[i]])
    }

    //get out all friend request elements in object and put them into an array for sorting.
    let friendRequestsToSort = new Array<FriendRequest>;
    for (var i in friendRequests) {
        friendRequestsToSort.push(friendRequests[i]);
    }

    //filter the chats into user chats and group chats
    let friendsChatsFiltered = new Array<[string: String, chat: UserChat]>;
    let groupChatsFiltered = new Array<[string: String, chat: GroupChat]>;
    toFilterArray.forEach(chat => {
        if (chat[1].constructor == UserChat && chat[1] instanceof UserChat) {
            friendsChatsFiltered.push([chat[0], chat[1]]);
        }
        else {
            groupChatsFiltered.push(chat);
        }
    })

    //sort chat and friend request arrays
    let doneSortedFriendsChatsArray = friendsChatsFiltered.sort((a, b) => {
        if ((a[1].lastMessageTime ?? 0) > (b[1].lastMessageTime ?? 0)) {
            return -1;
        }
        else if ((a[1].lastMessageTime ?? 0) < (b[1].lastMessageTime ?? 0)) {
            return 1;
        }
        return a[1].name.localeCompare(b[1].name);
    })
    let doneSortedGroupChatsArray = groupChatsFiltered.sort((a, b) => {
        if ((a[1].lastMessageTime ?? 0) > (b[1].lastMessageTime ?? 0)) {
            return -1;
        }
        else if ((a[1].lastMessageTime ?? 0) < (b[1].lastMessageTime ?? 0)) {
            return 1;
        }
        return a[1].name.localeCompare(b[1].name);
    })
    let doneSortedFriendsRequests = friendRequestsToSort.sort((a, b) => {
        if (a.sender._id == currentUser && b.sender._id == currentUser) {
            if (a.timestamp > b.timestamp) {
                return 1;
            }
            else if (a.timestamp < b.timestamp) {
                return -1
            }
            else {
                return userRepo[a.sender._id].name.localeCompare(userRepo[b.sender._id].name);
            }
        }
        else if (a.sender._id == currentUser) {
            return 1;
        }
        else if (b.sender._id == currentUser) {
            return -1;
        }
        else {
            if (a.timestamp > b.timestamp) {
                return 1;
            }
            else if (a.timestamp < b.timestamp) {
                return -1;
            }
            else {
                return userRepo[a.sender._id].name.localeCompare(userRepo[b.sender._id].name);
            }
        }
    })
    
    //put sorted arrays back into objects
    let friendsChatsSorted : userChatRepository = {};
    let groupChatsSorted : groupChatRepository = {};
    let friendRequestsSorted : friendRequestRepository = {};
    doneSortedFriendsChatsArray.forEach((item) => {
        let chat = item[1];
        friendsChatsSorted[chat.chatID] = item[1];
    })
    doneSortedGroupChatsArray.forEach((item) => {
        let chat = item[1];
        groupChatsSorted[chat.chatID] = item[1];
    })
    doneSortedFriendsRequests.forEach((item) => {
        friendRequestsSorted[item._id.toString()] = item;
    });

    //get notification counts

    //get group chat notification count
    let groupChatNotificationCount = 0;
    doneSortedGroupChatsArray.forEach((item) => {
        if (item[1].unreadMessages > 0) {
            groupChatNotificationCount += item[1].unreadMessages;
        }
    })

    //get friend chat notification count
    let friendChatNotificationCount = 0;
    doneSortedFriendsChatsArray.forEach((item) => {
        if (item[1].unreadMessages > 0) {
            friendChatNotificationCount += item[1].unreadMessages;
        }
    })

    let friendRequestNotificationCount = 0;
    doneSortedFriendsRequests.forEach((friendRequest) => {
        if (friendRequest.sender._id != currentUser) {
            friendRequestNotificationCount++;
        }
    })

    let friendsButtonNotificationCount = friendChatNotificationCount + friendRequestNotificationCount;


    return (
        <div className="basis-1/3 p-2.5
        border-solid border-1 border-cadet_gray-300 rounded-l-my
        bg-ghost_white flex flex-col flex-cols-2 resize-x">

            <h1 className='text-2xl	text-center mt-2.5 shrink-0'>Menu</h1>   
            <div className='flex flex-row flex-rows-1 mt-5 mb-7 gap-5 xl:gap-8 justify-center shrink-0'>
                
                <div className='flex flex-row justify-end'>
                    <NotifyButton notificationCount={groupChatNotificationCount} text="Chats" onClick={() => buttonToggler(0)} selected={selectedButton[0]} colorStyling='Light' color='PrimaryAlt' outline={true}/>
                </div> 
                <div className='flex flex-row justify-start'>
                    <NotifyButton notificationCount={friendsButtonNotificationCount} text="Friends" onClick={() => buttonToggler(1)} selected={selectedButton[1]} colorStyling='Light' color='PrimaryAlt' outline={true}/>
                </div>
            </div>

            <div className='flex flex-col mb-5 min-h-0 grow'>
                
                {/* These are the headers for the tabs */}
                <div className='flex flex-row flex-nowrap items-center'>
                    <h2 className={"flex text-xl text-left "  + (selectedButton[0] ? "block" : "hidden")}>Chats</h2>
                    <h2 className={"flex text-xl text-left "  + (selectedButton[1] ? "block" : "hidden")}>Friends</h2>
                    <button className={selectedButton[0] ? "block" : "hidden"} onClick={() => setAddingChat(!addingChat)}><i className="bi bi-plus-square stroke-1 text-black ml-3"></i></button>
                    <button className={(selectedButton[1] ? "block" : "hidden")} onClick={() => setAddingFriendRequest(!addingFriendRequest)}><i className="bi bi-plus-square stroke-1 text-black ml-3"></i></button>
                </div>

                {/* This is the code for the Chats Tab */}
                <div className={"grid grid-col-1 gap-1 overflow-auto custom_scrollbars " + (selectedButton[0] ? "block" : "hidden")}>  
                    {
                        Object.values(groupChatsSorted).length > 0 &&
                        Object.values(groupChatsSorted).map((chat) => {
                            return <ChatButton key={chat.chatID} chats={chats} chatID={chat.chatID} selected={chat.chatID == selectedChatID} setSelected={selectedChatToggler}/>
                        })                        
                    }
                </div>
                {Object.values(groupChatsSorted).length == 0 && selectedButton[0] &&
                <div className='flex flex-col grow justify-center'>
                    <h5 className='text-center text-charcoal font-light leading-6 px-5'>No chats yet. Add one by clicking the [+] button above. Or, ask a friend to add you to theirs.</h5>
                </div>
                }

                {/* This is the code for the Friends Tab */}

                <div className={"flex flex-col flex-nowrap gap-1 " + (selectedButton[1] ? "block" : "hidden")}>
                    {/* Tab switching buttons within Friends Tab */}
                    <div className={"flex flex-row flex-nowrap items-center gap-4 mt-1.5"}>
                        <NotifyButton notificationCount={friendChatNotificationCount} text='Friends' colorStyling='Light' color='Grayscale' outline={true} size='XS' selected={friendsSelectedButton[0]} onClick={() => friendsButtonToggler(0)}/>
                        <NotifyButton notificationCount={friendRequestNotificationCount} text='Requests' colorStyling='Light' color='Grayscale' outline={true} size='XS' selected={friendsSelectedButton[1]} onClick={() => friendsButtonToggler(1)}/>
                        
                    </div>

                    {/** Grey line below friends tab switching buttons */}
                    <div className="flex flex-row flex-nowrap items-center mt-1.5">
                        <div className="grow h-0 border-1 border-cadet_gray-300" ></div>
                    </div>
                    
                    {/* Content within friends tab's tab */}
                    <div className={"grid grid-col-1 gap-1 overflow-auto custom_scrollbars"}>
                        {friendsSelectedButton[0] &&
                            Object.values(friendsChatsSorted).length > 0 &&
                            Object.values(friendsChatsSorted).map((chat) => {
                                return <ChatButton key={chat.chatID} chats={chats} chatID={chat.chatID} selected={chat.chatID == selectedChatID} setSelected={selectedChatToggler} title={chat.otherUser.name + " (" + chat.otherUser.username + ")"}/>
                            })     
                        }
                        {friendsSelectedButton[1] &&
                            
                        Object.values(doneSortedFriendsRequests).length > 0 &&
                        Object.values(doneSortedFriendsRequests).map((friendRequest) => {
                            return <FriendRequestTile key={friendRequest._id} type={currentUser == friendRequest.sender._id ? "Outgoing" : "Incoming"} 
                            userID={currentUser == friendRequest.sender._id ? friendRequest.recipient._id : friendRequest.sender._id}
                            requestID={friendRequest._id} submitButtonDisabled={friendRequestStatus[friendRequest._id] === undefined ? false : friendRequestStatus[friendRequest._id]} acceptCallback={acceptFriendRequest} rejectCallback={rejectFriendRequest} 
                            cancelCallback={cancelPendingFriendRequest}/>
                        })

                        }
                        
                    </div>
                </div>
                {Object.values(friendsChatsSorted).length == 0 && selectedButton[1] && friendsSelectedButton[0] &&
                <div className='flex flex-col grow justify-center'>
                    <h5 className='text-center text-charcoal font-light leading-6 px-5'>No friends yet. Add one by clicking the [+] button above. Or, ask a friend to send you a request.</h5>
                </div>
                }
                {Object.values(doneSortedFriendsRequests).length == 0 && selectedButton[1] && friendsSelectedButton[1] &&
                <div className='flex flex-col grow justify-center'>
                    <h5 className='text-center text-charcoal font-light leading-6 px-5'>No friends requests yet. Add one by clicking the [+] button above. Or, ask a friend to send you a request.</h5>
                </div>
                }
                
            </div>
            
            
            <Copyright position="center"/>
        </div>
    );
}

export default Sidebar;