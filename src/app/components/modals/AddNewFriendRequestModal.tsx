import ChatWindowModal from "./ChatWindowModal";
import Button from "../buttons/button";
import Image from "next/image";
import { useState, ChangeEvent, useContext } from "react";
import { userRepository } from "@/app/app/page";
import { CurrentUserContext } from "../../context/currentUserContext";
import { UserRepositoryContext } from "../../context/userRepositoryContext";
import { FriendRequest } from "@/app/classes/friendRequest";
import { friendRequestRepository } from "@/app/app/page";
import { getUserIDfromUsername } from "../../functions/serverFunctions";
import { User } from "@/app/classes/user";


export default function AddNewFriendRequestModal({open, setOpen, friends, userRepoUpdater, friendRequests, friendRequestsUpdater, sendWSMessage}: {open: boolean, setOpen: (open: boolean) => void, friends: Array<string>, userRepoUpdater: (userRepo: userRepository) => void, friendRequests: friendRequestRepository, friendRequestsUpdater: (friendRequests: friendRequestRepository) => void, sendWSMessage: (message: object|string) => void}) {

    //get contexts
    const currUser = useContext(CurrentUserContext);
    const userRepo = useContext(UserRepositoryContext);

    const [usernameText, setUsernameText] = useState("");
    const [creatingFriendRequest, setCreatingFriendRequest] = useState(false); //if adding friend or not
    const [errorDisplayed, setErrorDisplayed] = useState(false); //if an error is shown or not
    const [onErrorText, setOnErrorText] = useState(""); //the error text shown, if shown    

    function addNewFriendRequestModalTextChange(e: ChangeEvent<HTMLInputElement>) {
        setUsernameText(e.target.value ?? "");
        setErrorDisplayed(false);
    }

    async function addFriendRequest() {
        setCreatingFriendRequest(true);

        let recipientUserID = await getUserIDfromUsername(usernameText);
        let recipientUser;
        if (recipientUserID === undefined) {
            setOnErrorText("Invalid username"); //set the error text
            setErrorDisplayed(true); //display the error text
            setCreatingFriendRequest(false); //set the button to not be submitting
            return;
        }
        if (friends.includes(recipientUserID)) {
            setOnErrorText("User is already a friend"); //set the error text
            setErrorDisplayed(true); //display the error text
            setCreatingFriendRequest(false); //set the button to not be submitting
            return;
        }

        try {
            recipientUser = new User(await (await fetch("/api/user/" + recipientUserID)).json());
        } catch (error) {
            
        }

        if (recipientUser !== undefined) {
            try {
                setCreatingFriendRequest(true); //set the button to be submitting
                let body = {id: recipientUserID}; //body for the api request.
                let res = await fetch("/api/friends/request", {method: "POST", body: JSON.stringify(body)}); //submit request to add chat
    
                if (res.ok) {
    
                    let response = await res.json();
    
                    let newFriendRequestID = response.data.id;
    
                    //now update the interface.

                    //update the friend requests
                    let copy = {...friendRequests};
                    copy[newFriendRequestID] = new FriendRequest({_id: newFriendRequestID, sender: userRepo[currUser], recipient: recipientUser, timestamp: new Date()});
                    friendRequestsUpdater(copy); //update the repository

                    //update the user repo
                    let userRepoCopy = {...userRepo};
                    userRepoCopy[recipientUser._id.toString()] = recipientUser;
                    userRepoUpdater(userRepoCopy);

                    sendWSMessage({
                        msgType: "userUpdateSubscribe",
                        data: {
                            userSubID: recipientUserID
                        }
                    }) //notify the websocket server that we need to subscribe to this user.
                    
                    setOpen(false); //close the modal
                    setCreatingFriendRequest(false); //set the button to not be submitting
                    setUsernameText(""); //reset the username field.
                }
                else {
                    let response = await res.json();
                    if (response.message) {
                        setOnErrorText(response.message); //set the error text
                    }
                    else {
                        setOnErrorText("Unable to create friend request"); //set the error text
                    }
                    setErrorDisplayed(true); //display the error text
                    setCreatingFriendRequest(false); //set the button to not be submitting
                }
                
            }
            catch (err) {
                console.log(err);
                setOnErrorText("Network error occurred");
                setErrorDisplayed(true); //error occurred, display the error text.
                setCreatingFriendRequest(false); //set the button to not be submitting
            }
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
                        <h1 className="font-normal text-2xl text-center leading-none mb-8">Send a Friend Request</h1>
                        <div className="flex flex-col wrap-none items-center">
                            <div className="flex flex-row wrap-none items-left mb-8">
                                <div className="relative">
                                    {/* <label className="absolute text-sm text-light text-charcoal" htmlFor={"friendsAdd"}>Chat members:</label> */}
                                    <label className="absolute w-full " htmlFor="friendRequestAdd">
                                        <div className="flex flex-row wrap-none w-full items-center">
                                            <p className="text-light text-charcoal text-sm">Username:</p>
                                            {errorDisplayed && <div className="flex flex-col wrap-none grow">
                                                <p className="self-end text-sm text-coral-800">{onErrorText}</p>
                                            </div>}
                                        </div>
                                    </label>
                                    <div id={"friendRequestAdd"} className='p-2.5 border border-solid border-cadet_gray-300 rounded-my mt-5 w-96'>
                                        <div className="flex flex-row flex-wrap items-center gap-y-1.5">
                                            <div className="flex flex-col items-left relative grow">
                                                <input value={usernameText} onChange={addNewFriendRequestModalTextChange} className='outline-none text-xs placeholder:text-xs placeholder:text-cadet_gray-600 grow ml-0.5' type="text" placeholder='Username'/>                                                
                                            </div>                                            
                                        </div>                                                
                                    </div>                                    
                                </div>
                                
                            </div>
                            <div className="flex flex-row wrap-none items-center">
                                <Button className="w-40" text="Create Friend Request" colorStyling="Heavy" color="Primary" size="Small" onClick={addFriendRequest} submissionButton={true} submissionText="Creating..." buttonSubmissionState={creatingFriendRequest}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ChatWindowModal>
    )
}