import { GetFancyTime } from "../util/functions";
import { msgStatusEnum } from "@/app/classes/messages";
import Button from "../button";
import { MouseEventHandler } from "react";

export default function MsgStatus({timestamp, msgStatus, msgFromUser, failedSend, resendCallback} : {timestamp: Date, msgStatus?: msgStatusEnum, msgFromUser: boolean, failedSend: boolean, resendCallback: MouseEventHandler}) {

    let msgTime = GetFancyTime(timestamp);

    return (
        <div className="flex flex-row flex-nowrap items-end pl-2.5 pr-2 msgStats">
            <div className="flex flex-row flex-nowrap items-center">
                <p className="text-xs text-charcoal-950 font-light leading-none mr-1.5 mt-1 text-nowrap">{failedSend ? "Failed to send -" : msgTime}</p>
                {msgFromUser && !failedSend && <div>
                
                    {msgStatus == msgStatusEnum.Queued &&
                        <div className="flex flex-row flex-nowrap items-center" title="Queued">
                            <i className="flex bi bi-person-fill stroke-1 stroke-cadet-gray-600 text-french_gray mb-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                            <i className="flexbi bi-arrow-right stroke-1 stroke-cadet-gray-600 text-french_gray mb-0.5 ml-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                            <i className="flex bi bi-person-fill stroke-1 stroke-cadet-gray-600 text-french_gray mb-0.5 ml-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                        </div>
                    }
                    {msgStatus == msgStatusEnum.Sending &&
                        <div className="flex flex-row flex-nowrap items-center" title="Sending">
                            <i className="flex bi bi-person-fill stroke-1 stroke-cadet-gray-600 text-coral mb-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                            <i className="flexbi bi-arrow-right stroke-1 stroke-cadet-gray-600 text-french_gray mb-0.5 ml-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                            <i className="flex bi bi-person-fill stroke-1 stroke-cadet-gray-600 text-french_gray mb-0.5 ml-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                        </div>
                    }
                    {msgStatus == msgStatusEnum.Sent &&
                        <div className="flex flex-row flex-nowrap items-center" title="Sent">
                            <i className="flex bi bi-person-fill stroke-1 stroke-cadet-gray-600 text-persian_green mb-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                            <i className="flexbi bi-arrow-right stroke-1 stroke-cadet-gray-600 text-coral mb-0.5 ml-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                            <i className="flex bi bi-person-fill stroke-1 stroke-cadet-gray-600 text-french_gray mb-0.5 ml-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                        </div>
                    }
                    {msgStatus == msgStatusEnum.Delivered &&
                        <div className="flex flex-row flex-nowrap items-center" title="Delivered">
                            <i className="flex bi bi-person-fill stroke-1 stroke-cadet-gray-600 text-persian_green mb-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                            <i className="flexbi bi-arrow-right stroke-1 stroke-cadet-gray-600 text-persian_green mb-0.5 ml-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                            <i className="flex bi bi-person-fill stroke-1 stroke-cadet-gray-600 text-coral mb-0.5 ml-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                        </div>
                    }
                    {msgStatus == msgStatusEnum.Read &&
                        <div className="flex flex-row flex-nowrap items-center" title="Read">
                            <i className="flex bi bi-person-fill stroke-1 stroke-cadet-gray-600 text-persian_green mb-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                            <i className="flexbi bi-arrow-right stroke-1 stroke-cadet-gray-600 text-persian_green mb-0.5 ml-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                            <i className="flex bi bi-person-fill stroke-1 stroke-cadet-gray-600 text-persian_green mb-0.5 ml-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i>
                        </div>
                    }
                    {msgStatus == msgStatusEnum.ReadCompact && <div className="flex flex-row flex-nowrap items-center" title="Read"><i className="bi bi-people-fill stroke-1 text-persian_green mb-0.5" style={{maxWidth: "14px", maxHeight:"14px"}}></i></div>}
                </div>}
                {failedSend &&
                <div>
                    <Button text="Resend" colorStyling="Light" color="PrimaryAlt" outline={true} size="XXS" onClick={resendCallback} className="mt-0.5"></Button>
                </div>
                }
            </div>
        </div>
    )
}