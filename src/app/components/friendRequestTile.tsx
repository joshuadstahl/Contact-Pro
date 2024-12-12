import Link from 'next/link';
import { useContext, useState } from 'react';
import { CurrentUserContext } from '../context/currentUserContext';
import { UserRepositoryContext } from '../context/userRepositoryContext';
import { chatRepository } from '../app/page';
import ProfilePhotoWithStatus from './photo/profilePhotoWithStatus';
import Image from 'next/image';
import SquareIconButton from './buttons/SquareIconButton';

export default function FriendRequestTile({type, userID, requestID, rejectCallback = (reqID: string) => {}, acceptCallback = (reqID: string) => {}, cancelCallback = (reqID: string) => {}, submitButtonDisabled = false}: {type: "Incoming"|"Outgoing", userID: string, requestID: string, rejectCallback?: (reqID: string) => void, acceptCallback?: (reqID: string) => void, cancelCallback?: (reqID: string) => void, submitButtonDisabled: boolean}) {

    //get the current application user from the context API
    const currUser = useContext(CurrentUserContext);
    const userRepo = useContext(UserRepositoryContext);

    const [buttonHovered, setButtonHovered] = useState(false);

    let user = userRepo[userID] === undefined  ? {name: "", username: "", photo: "", _id: "", status: 0} : userRepo[userID];
    if (userRepo[userID] === undefined) {
        return;
    }

    return (
        <div id={requestID} className={" rounded-l-my rounded-t-my rounded-br min-w-0" + (type == "Incoming" ? " border-s-2 border-solid border-persian_orange" : "")}>
            <div className="flex flex-row p-2 gap-6 items-center">
                <div className="basis-auto relative shrink-0">
                    <ProfilePhotoWithStatus user={user}/>
                </div>

                <div className='flex flex-col gap-auto flex-nowrap min-w-0 grow'>
                    <h3 className="text-normal text-persian_green grow text-base truncate" title={user.name + " (" + user.username + ")"}>{user.name}</h3>
                    
                </div>
                {type == "Incoming" &&
                    <div className='flex flex-row items-center shrink-0 gap-2.5'>
                        <SquareIconButton callbackFn={() => rejectCallback(requestID)} alt="reject friend request" borderColor='Red' iconSrc='/icons/close.svg' title='reject friend request' disabled={submitButtonDisabled}/>
                        <SquareIconButton callbackFn={() => acceptCallback(requestID)} alt="accept friend request" borderColor='Green' iconSrc='/icons/check.svg' title='accept friend request' disabled={submitButtonDisabled}/>
                    </div>
                }
                {type == "Outgoing" && 
                    <div onMouseEnter={() => {setButtonHovered(true)}} onMouseLeave={() => {setButtonHovered(false)}}>
                        <div className={(buttonHovered ? "hidden" : "")}>
                            <SquareIconButton callbackFn={() => cancelCallback(requestID)} alt="friend request pending" borderColor='None' iconSrc='/icons/stopwatch-fill.svg' title='friend request pending' hover={false} disabled={submitButtonDisabled}/>
                        </div>
                        <div className={(buttonHovered ? "" : "hidden")}>
                            <SquareIconButton callbackFn={() => cancelCallback(requestID)} alt="cancel pending friend request" borderColor='None' iconSrc='/icons/close.svg' title='cancel pending friend request' disabled={submitButtonDisabled}/>
                        </div>
                    </div>
                }
            </div>
        </div>
        
    );
}