import { Assistant } from "next/font/google";
import ProfilePhoto  from "../photo/profilePhoto";
import { CurrentUserContext } from '../../context/currentUserContext';
import { UserRepositoryContext } from "../../context/userRepositoryContext";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { GetColorBgClass, GetColorTextClass, GetStatusName } from '../../functions/functions';
import DropdownMenuItem from "../dropdownMenuItem";
import { userStatus, User } from "../../classes/user";
import { userAgent } from "next/server";
import { userRepository } from "@/app/app/page";

const assistant = Assistant(
    { 
        subsets: ["latin"]
    }
);

export default function Navbar({sendWSMessage, setStatus, updateUserRepo, toggleLogoutModal} : {sendWSMessage: (msg: Object) => void, setStatus: (usr: string, usrStatus: userStatus) => void, updateUserRepo: (usrRepo: userRepository) => void, toggleLogoutModal: () => void}) {
    const currUserContext = useContext(CurrentUserContext); //the current user's id
    const userRepo = useContext(UserRepositoryContext); //the user repository
    let currUser = userRepo[currUserContext]; //get the current user object

    let statusColor = GetColorBgClass(currUser.status); //get the user's current status color class
    let statusTextColor = GetColorTextClass(currUser.status); //get the user's current status' name

    //state to keep track if the dropdown is open or not
    const [toggled, setToggled] = useState(false);

    //state to keep track if the status subdropdown is open or not
    const [statusToggled, setStatusToggled] = useState(false);

    //state to keep track if the sideLeft should slide up.
    const [slideUp, setSlideUp] = useState(false);

    //toggle dropdown and dropdown arrow, the button in the navbar
    function acntDropToggle() {  
        if (statusToggled) {
            setStatusToggled(false);
            setSlideUp(true);
            setTimeout(() => setSlideUp(false), 200);
        }
        else {
            setToggled(!toggled);
        }
    }

    //the button in the top level dropdown to open the status dropdown
    function statusDropDropdown() {
        setStatusToggled(true);
        setToggled(false);
    }

    //the back button in the status dropdown
    function backFromStatusToggle() {
        setToggled(true);
        setStatusToggled(false);
    }

    //updates the upper level current user with the new status
    function updateUserStatus(newStatus: userStatus) {
        let out = {
            msgType: "userUpdate",
            data: {
                updateType: "status",
                status: newStatus
            }
        }
        sendWSMessage(out);
        setStatus(currUserContext, newStatus);
        // let copy = {...userRepo};
        // copy[currUserContext].status = newStatus;
        // updateUserRepo(copy);
    }

    //sets the current user's status to do not disturb
    function updateStatusDonotdisturb() {
        updateUserStatus(userStatus.DO_NOT_DISTURB);
    }

    //sets the current user's status to online
    function updateStatusOnline() {
        updateUserStatus(userStatus.ONLINE);
    }

    //sets the current user's status to offline
    function updateStatusOffline() {
        updateUserStatus(userStatus.OFFLINE);
    }

    //if user clicks outside of dropdown or dropdown button, reset dropdown and dropdown button.
    //Needs to be in "useEffect" because otherwise "window" is undefined. (eg. not available on 
    //server side)
    useEffect(() => {

     
        window.onclick = function(event: MouseEvent) {
            let target = event.target as HTMLElement;
            let bool = target !== undefined ? (target.classList.contains('acntDrop') || target.classList.contains('noDropClose')) : true;
            if (!bool && toggled) {
                setToggled(false);
                setStatusToggled(false);
            }
            else if (!bool && statusToggled) {
                setToggled(false);
                setStatusToggled(false);
                setSlideUp(true);
                setTimeout(() => setSlideUp(false), 200);
            }
        }


    });

    return (
        <div className="flex-initial mb-2.5">
            <div className="flex flex-row pl-5 border-solid border-1 border-cadet_gray-400 rounded-my bg-white">
                <div className="flex flex-row flex-nowrap items-center">
                    <h1 className={assistant.className + " font-bold text-3xl text-persian_green"}>Contact Pro</h1>
                </div>
                <div className="flex flex-row flex-nowrap items-center grow place-content-end">

                    <div className="relative">
                        <button onClick={acntDropToggle} className={"rounded-my hover:bg-cadet_gray-100 focus:bg-cadet_gray-100 active:bg-cadet_gray-300 acntDrop " + ((toggled || statusToggled) ? "bg-cadet_gray-100" : "")}>
                            <div className="flex flex-row flex-nowrap items-center py-1.5 px-2.5 no-click">
                        
                                <div className="relative">
                                    <ProfilePhoto photo={currUser.photo} tSizeNumber={10}/>
                                    <div title={GetStatusName(currUser.status)} className={"absolute bottom-0 right-0 rounded-full " + statusColor + " w-2.5 h-2.5"}></div>
                                </div>
                                <div className="ml-2.5">
                                    <h2 className="text-left text-xs text-coral">{currUser.name}</h2>
                                    <h2 className="text-left text-xs">({currUser.username})</h2>
                                </div>
                                <Image className={"filter-charcoal ml-3 arrow " + ((toggled || statusToggled) ? "arrowFlipped" : "")} alt='' src='/icons/arrow-down.svg' width={20} height={20}></Image>
                            </div>
                        
                        </button>
                        <div className={"dropdownSlidedown absolute right-0 -left-4 bg-white " +
                        "rounded-my border border-cadet_gray-300 p-2.5 z-30 noDropClose " + (toggled ? "dropdownSlidedownShown" : "")}>
                            <DropdownMenuItem>
                                <i className="bi bi-person-fill ml-1.5 mr-1.5 text-charcoal"></i>
                                <p className="text-xs text-charcoal ">Account</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <i className="bi bi-gear ml-1.5 mr-1.5 text-charcoal"></i>
                                <p className="text-xs text-charcoal">Settings</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem callback={statusDropDropdown} noClose={true}>
                                <i className="bi bi-caret-right-fill ml-1.5 mr-1.5 text-charcoal"></i>
                                <p className="text-xs text-charcoal">Set Status</p>
                                <i title={GetStatusName(currUser.status)} className={"bi bi-circle-fill ml-1.5 " + statusTextColor}></i>
                            </DropdownMenuItem>
                            <DropdownMenuItem callback={toggleLogoutModal}>
                                <i className="bi bi-door-open ml-1.5 mr-1.5 text-do_not_disturb"></i>
                                <p className="text-xs text-do_not_disturb">Log out</p>
                            </DropdownMenuItem>
                        </div>
                        <div className={"dropdownSlideLeft absolute top-full bg-white rounded-my border " +
                            "border-cadet_gray-300 p-2.5 z-30 noDropClose" + (statusToggled ? " dropdownSlideLeftShown" : "") + (slideUp ? " dropdownSlideLeftUp" : "")}>
                            <DropdownMenuItem callback={backFromStatusToggle} noClose={true}>
                                <i className="bi bi-caret-left-fill ml-1.5 mr-1.5 text-charcoal"></i>
                                <p className="text-xs text-charcoal">Back</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem callback={updateStatusOnline}>
                                <i className="bi bi-circle-fill ml-1.5 mr-1.5 text-online_green"></i>
                                <p className="text-xs text-charcoal">Online</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem callback={updateStatusDonotdisturb}>
                                <i className="bi bi-circle-fill ml-1.5 mr-1.5 text-do_not_disturb"></i>
                                <p className="text-xs text-charcoal">Do Not Disturb</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem callback={updateStatusOffline}>
                                <i className="bi bi-circle-fill ml-1.5 mr-1.5 text-offline_gray"></i>
                                <p className="text-xs text-charcoal">Offline</p>
                            </DropdownMenuItem>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}