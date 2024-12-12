import Button from "./button"
import React from "react"


export default function NotifyButton({notificationCount, size="Large", ...rest} : 
    {notificationCount: number, size?: "Large"|"Small"|"XS"|"XXS"} & React.ComponentPropsWithoutRef<typeof Button>) {

    let bubbleSizing = "";
    let textSize = "";
    if (size == "Large" || size == "Small") {
        bubbleSizing = " size-5";
        textSize = " text-[0.75rem] leading-[1.25rem] -mb-[0.06rem]";
    }
    else if (size == "XS" || size == "XXS") {
        bubbleSizing = " size-[1.125rem]";
        textSize = " text-[0.625rem] leading-[1.125rem] -mb-[0.09868rem]";
    }

    return (
        <Button {...rest} size={size}>
            {notificationCount > 0 &&
                <div className={"flex items-center justify-center " +
                "rounded-full bg-persian_orange ml-2.5 shadow-notify" + bubbleSizing}>
                    <span className={"inline-block text-center align-middle text-white" + textSize}>{notificationCount > 9 ? "9+": notificationCount}</span>
                </div>
            }            
        </Button>
    )
}