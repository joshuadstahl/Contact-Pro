import ChatWindowModal from "./ChatWindowModal";
import TextInput from "../textInput";
import Button from "../buttons/button";
import Image from "next/image";
import { useState, ChangeEvent, KeyboardEvent, useContext } from "react";
import { chatRepository } from "@/app/app/page";
import { GroupChat, UserChat } from "@/app/classes/chats";
import { CurrentUserContext } from "../../context/currentUserContext";
import { UserRepositoryContext } from "../../context/userRepositoryContext";
import FriendCloseableTextBubble from "../FriendCloseableTextBubble";
import InvisibleTextBubble from "../InvisibleTextBubble";
import ProfilePhoto from "../photo/profilePhoto";


export default function AddNewChatModal({open, setOpen, chatGroups, chatGroupsUpdater, sendWSMessage, inputFriends}: {open: boolean, setOpen: (open: boolean) => void, chatGroups:chatRepository, chatGroupsUpdater: (chatgroups: chatRepository) => void, sendWSMessage: (msg: Object) => void, inputFriends: Array<string>}) {

    interface friendSearchItem {
        name: string,
        username: string,
        _id: string,
        photo: string
    }

    //get contexts
    const userRepo = useContext(UserRepositoryContext);

    const [friends, setFriends] = useState<Array<friendSearchItem>>([]);
    const [friendSearchText, setFriendSearchText] = useState("");
    const [filteredFriends, setFilteredFriends] = useState(friends);
    const [newGroupMembers, setNewGroupMembers] = useState(new Array<friendSearchItem>);
    const [dropdownOpen, setDropdownOpen] = useState(false); //if the search results is open or not.
    const [creatingChat, setCreatingChat] = useState(false); //if creating chat or not
    const [errorDisplayed, setErrorDisplayed] = useState(false); //if an error is shown or not
    const [onErrorText, setOnErrorText] = useState(""); //the error text shown, if shown
    const [chatName, setChatName] = useState(""); //the name of the new chat
    
    //create a array of friend search items (if necessary)
    if (friends.length + newGroupMembers.length != inputFriends.length) {
        let searchableFriends : Array<friendSearchItem> = [];
        for (let i = 0; i < inputFriends.length; i++) {
            //as long as the input friend is not in 
            if (inputFriends[i] in userRepo) {
                let found = newGroupMembers.find((grpMember: friendSearchItem) => {
                    if (inputFriends[i] == grpMember._id) {
                        return true;
                    }
                    return false;
                })
                if (!found) {
                    let user = userRepo[inputFriends[i]];
                    searchableFriends.push({
                        name: user.name,
                        username: user.username,
                        _id: user._id,
                        photo: user.photo
                    });
                }
            }
        }

        //set the friend list
        setFriends(searchableFriends);
    }

    function resetFriendsList() {
        let friendsArray : Array<friendSearchItem> = [];
        inputFriends.forEach((friendID) => {
            if (friendID in userRepo) {
                let user = userRepo[friendID];
                friendsArray.push({
                    name: user.name,
                    username: user.username,
                    _id: user._id,
                    photo: user.photo
                });
            }
        })
        setFriends(friendsArray);
    }
    

    function addNewChatModalTextChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.value == "") {
            setDropdownOpen(false);
            setFilteredFriends(friends);
        }
        else {
            if (dropdownOpen == false) {
                setDropdownOpen(true);
            }
            filterFriends(e.target.value);
        }
        setFriendSearchText(e.target.value ?? "");
    }

    function chatNameTextChange(e: ChangeEvent<HTMLInputElement>) {
        setChatName(e.target.value ?? "");
    }

    function addNewChatModalMemberFieldKeyDown(evt: KeyboardEvent) {
        if (evt.key == "Enter" && filteredFriends.length == 1) {
            //automatically add a user if there is only one search result and the user hits enter.
            evt.preventDefault();
            addNewGroupMember(filteredFriends[0]);
        }
        else if (evt.key == "Backspace" && friendSearchText == ""){
            //remove the last friend in the list of newGroupMembers
            removeNewGroupMember(newGroupMembers[newGroupMembers.length - 1]);
        }
    }

    function filterFriends(search: string) {
        let copy = [...friends];
        let searchLower = search.toLowerCase();
        
        let filtered = copy.filter((friend) => {
            if (friend.name.toLowerCase().indexOf(searchLower) != -1) {
                return friend;
            }
            else if (friend.username.toLowerCase().indexOf(searchLower) != -1) {
                return friend;
            }
        })

        let sorted = filtered.sort((a, b) => {
            if (a.name > b.name) {
                return 1;
            }
            else if (a.name < b.name) {
                return -1;
            }
            else {
                return 0;
            }
        })

        setFilteredFriends(sorted);
        return sorted;
    }

    function addNewGroupMember(usr: friendSearchItem) {
        //remove the friend from the friends list. (because a friend can't be added twice to a group)
        let friendscopy = [...friends];

        friendscopy = friendscopy.filter((frnd) => {
            if (frnd.username != usr.username) {
                return frnd;
            }
        })
        setFriends(friendscopy);

        let copy = [...newGroupMembers];
        copy.push(usr);
        setNewGroupMembers(copy);
        setFilteredFriends(friendscopy);
        setFriendSearchText("");
        document.getElementById("addFriendsSearch")?.focus();

        //reset any error message
        setOnErrorText("");
        setErrorDisplayed(false); //hide error
    }

    function removeNewGroupMember(usr: friendSearchItem) {
        //add the friend back to the friends list from the initialFriends list.
        let friendsCopy = [...friends];
        friendsCopy.push(usr);
        setFriends(friendsCopy);
        filterFriends(friendSearchText);

        //remove the user from the newGroupMembers array.
        let copy = [...newGroupMembers];
        copy = copy.filter((frnd) => {
            if (frnd.username != usr.username) {
                return frnd;
            }
        })

        setNewGroupMembers(copy);
        resetFriendsList() //reset the friends list.

        //reset any error message
        setOnErrorText("");
        setErrorDisplayed(false); //hide error
    }

    async function createChat() {
        setCreatingChat(true);

        if (newGroupMembers.length == 0) {
            setOnErrorText("A chat must have a least one member."); //set the error text
            setErrorDisplayed(true); //display the error text
            setCreatingChat(false); //set the button to not be submitting
            return;
        }
        try {
            setCreatingChat(true); //set the button to be submitting
            let members = newGroupMembers.map((mbr) => mbr._id);
            let body = {name: chatName, members: members}; //body for the api request.
            let res = await fetch("/api/chat", {method: "POST", body: JSON.stringify(body)}); //submit request to add chat

            if (res.ok) {

                let response = await res.json();
                let newID = response.chatID;
                let newName = response.name;

                //only group chats can be made, user chats are made via accepting friend requests.
                let newChat = new GroupChat({name: newName, messages:[], photo: "", chatID: newID});

                //notify the websocket server of the new chat
                sendWSMessage({"msgType":"newChat", data: {_id: newID}});
                
                //now update the interface.
                let copy = {...chatGroups};
                copy[newID] = newChat;
                chatGroupsUpdater(copy); //update the repository
                setOpen(false); //close the modal
                setCreatingChat(false); //set the button to not be submitting
                setNewGroupMembers(new Array<friendSearchItem>); //reset the new group members field
                setChatName(""); //reset the chat name field.
                resetFriendsList() //reset the friends list.
            }
            else {
                setOnErrorText("Unable to create chat"); //set the error text
                setErrorDisplayed(true); //display the error text
                setCreatingChat(false); //set the button to not be submitting
            }
            
        }
        catch (err) {
            console.log(err);
            setOnErrorText("Network error occurred");
            setErrorDisplayed(true); //error occurred, display the error text.
            setCreatingChat(false); //set the button to not be submitting
        }
    }

    return (
        <ChatWindowModal shown={open} backdrop={true} delayShow={50}>
            <div className="flex flex-col wrap-none items-center grow">
                <div className="border border-cadet_gray-300 rounded-my  bg-white">
                    <div className="flex flex-col wrap-none items-end">
                        <button onClick={() => {setOpen(false)}} className="w-12 h-12"><Image className="filter-charcoal w-12 h-12" src="/icons/close-small.svg" width={48} height={48} alt="close"></Image></button>
                    </div>
                    <div className="px-8 pb-8">
                        <h1 className="font-normal text-2xl text-center leading-none mb-8">Add a Chat</h1>
                        <div className="flex flex-col wrap-none items-center">
                            <div className="flex flex-row wrap-none items-center mb-6">
                                <TextInput placeholder='New chat name' label="Chat name:" value={chatName} changedCallback={chatNameTextChange}></TextInput>
                            </div>
                            <div className="flex flex-row wrap-none items-left mb-8">
                                <div className="relative">
                                    {/* <label className="absolute text-sm text-light text-charcoal" htmlFor={"friendsAdd"}>Chat members:</label> */}
                                    <label className="absolute w-full " htmlFor="friendsAdd">
                                        <div className="flex flex-row wrap-none w-full items-center">
                                            <p className="text-light text-charcoal text-sm">Chat members:</p>
                                            {errorDisplayed && <div className="flex flex-col wrap-none grow">
                                                <p className="self-end text-sm text-coral-800">{onErrorText}</p>
                                            </div>}
                                        </div>
                                    </label>
                                    <div id={"friendsAdd"} className='p-2.5 border border-solid border-cadet_gray-300 rounded-my mt-5 w-96'>
                                        <div className="flex flex-row flex-wrap items-center gap-y-1.5">
                                            <div className="flex flex-col items-left relative grow">
                                                <input value={friendSearchText} id="addFriendsSearch" onChange={addNewChatModalTextChange} onKeyDown={addNewChatModalMemberFieldKeyDown} className='outline-none text-xs placeholder:text-xs placeholder:text-cadet_gray-600 grow ml-0.5' type="text" placeholder='Search for friends'/>
                                                <div className={'absolute bg-white border border-solid border-cadet_gray-300 rounded-my px-5 py-2.5 text-xs -left-3 top-7 wrap-none z-10 ' + (friendSearchText != "" ? "" : "hidden")}>
                                                    {
                                                        filteredFriends.length > 0 && filteredFriends.map((usr) => {
                                                            return <div className="flex flex-row items-center wrap-none mb-1.5" key={usr.name + usr.username}>
                                                                <ProfilePhoto photo={usr.photo} tSizeNumber={5} className="mb-0.5"/>
                                                                <button className="text-nowrap ml-1.5" onClick={() => addNewGroupMember(usr)}>{usr.name + " (" + usr.username + ")"}</button>
                                                            </div>
                                                        })
                                                    }
                                                    {
                                                        filteredFriends.length == 0 && <div key={"noresult"}><button>{"No Result"}</button></div>
                                                    }
                                                </div>
                                                
                                            </div>                                            
                                        </div>                                                
                                    </div>
                                    {newGroupMembers.length > 0 && <div id={"membersList"} className='rounded-my mt-4 w-96'>
                                        <div className="flex flex-row flex-wrap items-center gap-y-1.5">
                                            {
                                                newGroupMembers.map((frnd) => {
                                                    return <FriendCloseableTextBubble key={frnd.name + frnd.username} name={frnd.name} username={frnd.username} photo={frnd.photo} xCallback={() => removeNewGroupMember(frnd)}/>
                                                })
                                            }
                                            
                                        </div>
                                    </div>}
                                    
                                </div>
                                
                            </div>
                            <div className="flex flex-row wrap-none items-center">
                                <Button className="w-40" text="Create Chat" colorStyling="Heavy" color="Primary" size="Small" onClick={createChat} submissionButton={true} submissionText="Creating..." buttonSubmissionState={creatingChat}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ChatWindowModal>
    )
}