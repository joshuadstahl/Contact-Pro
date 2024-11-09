import { ChangeEvent } from "react";

export default function TextInput({id = "", value = "", placeholder, label, changedCallback = (event: ChangeEvent<HTMLInputElement>) => {}} : {id?: string, value?: string, placeholder: string, label: string, changedCallback?: (event: ChangeEvent<HTMLInputElement>) => void}) {
    
    let derivedID = id ? id : placeholder + label;
    return (
        <div className="">
            <label className="absolute text-sm text-light text-charcoal" htmlFor={derivedID}>{label}</label>
            <input onChange={changedCallback} id={derivedID} className="text-xs outline-none p-2.5 border border-solid border-cadet_gray-300 rounded-my mt-5 w-96" type="text" placeholder={placeholder} />
        </div>
    )
}