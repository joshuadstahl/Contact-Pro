import { useState } from "react";


export default function CloseableTextBubble({text, xCallback} : {text: string, xCallback: Function}) {

    
    let colors = ["bg-moss_green-200", "bg-persian_orange-200"];
    const [color, setColor] = useState(colors[Math.floor(Math.random() * colors.length)]);

    return (
        <div className={"flex flex-row px-2.5 py-1.5 mr-1.5 rounded-my wrap-none " + (color)}>
            <div className="flex flex-row items-center wrap-none">
                <p className="text-xs text-light mr-2.5 text-nowrap">{text}</p>
                <button className="text-xs text-light" onClick={() => xCallback()}><i className="bi bi-x-lg text-charcoal"></i></button>
            </div>
        </div>
    )
}