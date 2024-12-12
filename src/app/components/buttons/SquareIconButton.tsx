import { MouseEventHandler } from "react";
import Image from "next/image";

export default function SquareIconButton({callbackFn, iconSrc, alt, borderColor, title = "", hover = true, disabled = false}: 
    {callbackFn: MouseEventHandler, iconSrc: string, alt: string, borderColor: "Red"|"Green"|"Grey"|"None", title?: string, hover?: boolean, disabled?: boolean}) {

    let borderColorClass = "";
    switch (borderColor) {
        case "Green":
            borderColorClass = " border-online_green disabled:border-online_green/50";
            break;
        case "Grey":
            borderColorClass = " border-offline_grey disabled:border-offline_grey/50";
            break;
        case "Red":
            borderColorClass = " border-do_not_disturb disabled:border-do_not_disturb/50";
    }

    let borderClasses = borderColorClass != "" ? "border-1 border-solid" + borderColorClass : "";

    let hoverClasses = hover ? " bg-black/0 enabled:hover:bg-black/[.03] enabled:focus:bg-black/[.03] enabled:active:bg-black/10 disabled:bg-black/[.03] " : "";

    return (
        <button onClick={callbackFn} className={"bg-ghost_white rounded-[5px] " + borderClasses + hoverClasses} disabled={disabled} title={title}><Image className="filter-charcoal" alt={alt} src={iconSrc} width={30} height={30}></Image></button>
    )
}