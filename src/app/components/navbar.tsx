import { Assistant } from "next/font/google";
import ProfilePhoto  from "./profilePhoto";
import { CurrentUserContext } from './context/currentUserContext';
import Link from "next/link";
import { useContext } from "react";
import { GetColorClass } from './util/functions';

const assistant = Assistant(
    { 
        subsets: ["latin"]
    }
);

export default function Navbar({profilePic = ""}) {
    let currUser = useContext(CurrentUserContext);
    let statusColor = GetColorClass(currUser.status);

    return (
        <div className="flex-initial mb-2.5">
            <div className="flex flex-row pl-5 border-solid border-1 border-cadet_gray-400 rounded-my bg-white">
                <div className="flex flex-row flex-nowrap items-center">
                    <h1 className={assistant.className + " font-bold text-2xl text-persian_green"}>Contact Pro</h1>
                </div>
                <div className="flex flex-row flex-nowrap items-center grow place-content-end">
                    <Link href="" className="rounded-my hover:bg-cadet_gray-100 focus:bg-cadet_gray-100 active:bg-cadet_gray-300">
                        <div className="flex flex-row flex-nowrap items-center py-1.5 px-2.5">
                        
                            <div className="relative">
                                <ProfilePhoto photo={currUser.photo} tSizeNumber={10}/>
                                <div className={"absolute bottom-0 right-0 rounded-full " + statusColor + " w-2.5 h-2.5"}></div>
                            </div>
                            <div className="ml-2.5">
                                <h2 className="text-left text-xs text-coral">{currUser.name}</h2>
                                <h2 className="text-left text-xs">({currUser.userID})</h2>
                            </div>
                            <span className="ml-2.5 material-symbols-outlined text-charcoal">
                                keyboard_arrow_down
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}