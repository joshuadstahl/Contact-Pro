import { GetFancyTime } from "../util/functions";

export enum msgStatusEnum {
    Queued,
    Sending,
    Sent,
    Delivered,
    Read,
    ReadCompact
}
export default function MsgStatus({timestamp, msgStatus, msgFromUser} : {timestamp: Date, msgStatus: msgStatusEnum, msgFromUser: boolean}) {

    let msgTime = GetFancyTime(timestamp);

    return (
        <div className="flex flex-row flex-nowrap items-end pl-2.5 pr-2 msgStats">
            <p className="text-xs text-charcoal-950 font-light leading-none mr-1.5 text-nowrap">{msgTime}</p>
            {msgFromUser && <div>
                
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
        </div>
    )
}