import { useState } from "react";


export default function CloseableTextBubble({className, xCallback, children} : {className: String, xCallback: () => void, children: React.ReactNode}) {

    return (
        <div className={"flex flex-row px-2.5 py-1.5 mr-1.5 rounded-my wrap-none " + (className)}>
            <div className="flex flex-row items-center wrap-none">
                {children}
                <button className="text-xs text-light" onClick={xCallback}><i className="bi bi-x-lg text-charcoal"></i></button>
            </div>
        </div>
    )
}