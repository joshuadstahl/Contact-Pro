'use client'
import { MouseEventHandler, useState } from "react";

export default function Button({text = "this is button text", colorStyling, color, outline = false, size = "Large", width = "auto", onClick, submissionButton = false, submissionText = "", buttonSubmissionState = undefined, disabled = false, selected = false, className = ""} : 
    {text: string, colorStyling: "Light"|"Heavy", color: "Grayscale"|"Primary"|"Secondary"|"PrimaryAlt"|"SecondaryAlt",
        outline?: boolean, size?: "Large"|"Small", width?: "auto"|number, onClick:MouseEventHandler, submissionButton?: boolean, submissionText?: string, buttonSubmissionState?: boolean|undefined, disabled?: boolean, selected?: boolean, className?: string}) {

    let styling = "";
    let whenSelectedColor = "";
    let notSelectedColor = "";
    switch (color){
        case ("Grayscale"): {
            if (colorStyling == "Light"){
                styling = "enabled:hover:bg-cadet_gray-100 enabled:focus:bg-cadet_gray-200 enabled:active:bg-cadet_gray-200";
                whenSelectedColor = "bg-cadet_gray-200";
                notSelectedColor = "bg-cadet_gray-50";
                styling += outline ? " border-solid border-1 border-cadet_gray-200" : "";
            }
            else {
                styling = "enabled:hover:bg-cadet_gray enabled:focus:bg-cadet_gray-600 enabled:active:bg-cadet_gray-600";
                whenSelectedColor = "bg-cadet_gray-600";
                notSelectedColor = "bg-cadet_gray-400";
                styling += outline ? " border-solid border-1 border-cadet_gray-600" : "";
            }
            break;
        }
        case ("Primary"): {
            if (colorStyling == "Light"){
                styling = "enabled:hover:bg-persian_green-100 enabled:focus:bg-persian_green-200 enabled:active:bg-persian_green-200";
                whenSelectedColor = "bg-persian_green-200";
                notSelectedColor = "bg-persian_green-50";
                styling += outline ? " border-solid border-1 border-persian_green-200" : "";
            }
            else {
                styling = "enabled:hover:bg-persian_green enabled:focus:bg-persian_green-600 enabled:active:bg-persian_green-600";
                whenSelectedColor = "bg-persian_green-600";
                notSelectedColor = "bg-persian_green-400";
                styling += outline ? " border-solid border-1 border-persian_green-600" : "";
            }
            break;
        }
        case ("PrimaryAlt"): {
            if (colorStyling == "Light"){
                styling = "enabled:hover:bg-moss_green-100 enabled:focus:bg-moss_green-200 enabled:active:bg-moss_green-200";
                whenSelectedColor = "bg-moss_green-200";
                notSelectedColor = "bg-moss_green-50";
                styling += outline ? " border-solid border-1 border-moss_green-200" : "";
            }
            else {
                styling = "enabled:hover:bg-moss_green-500 enabled:focus:bg-moss_green-600 enabled:active:bg-moss_green-600";
                whenSelectedColor = "bg-moss_green-600";
                notSelectedColor = "bg-moss_green";
                styling += outline ? " border-solid border-1 border-moss_green-600" : "";
            }
            break;
        }
        case ("Secondary"): {
            if (colorStyling == "Light"){
                styling = "enabled:hover:bg-coral-100 enabled:focus:bg-coral-200 enabled:active:bg-coral-200";
                whenSelectedColor = "bg-coral-200";
                notSelectedColor = "bg-coral-50";
                styling += outline ? " border-solid border-1 border-coral-200" : "";
            }
            else {
                styling = "enabled:hover:bg-coral-500 enabled:focus:bg-coral-600 enabled:active:bg-coral-600";
                whenSelectedColor = "bg-coral-600";
                notSelectedColor = "bg-coral";
                styling += outline ? " border-solid border-1 border-coral-600" : "";
            }
            break;
        }
        case ("SecondaryAlt"): {
            if (colorStyling == "Light"){
                styling = "enabled:hover:bg-persian_orange-100 enabled:focus:bg-persian_orange-200 enabled:active:bg-persian_orange-200";
                whenSelectedColor = "bg-persian_orange-200";
                notSelectedColor = "bg-persian_orange-50";
                styling += outline ? " border-solid border-1 border-persian_orange-200" : "";
            }
            else {
                styling = "enabled:hover:bg-persian_orange-500 enabled:focus:bg-persian_orange-600 enabled:active:bg-persian_orange-600";
                whenSelectedColor = "bg-persian_orange-600";
                notSelectedColor = "bg-persian_orange";
                styling += outline ? " border-solid border-1 border-persian_orange-600" : "";
            }
            break;
        }

    }

    styling += colorStyling == "Light" ? " text-charcoal" : " text-white";
    styling += size == "Large" ? " px-5 py-2.5" : " px-2.5 py-1.5";
    styling += selected ? (" " + whenSelectedColor) : (" " + notSelectedColor);
    styling += " rounded-5px text-sm"; 
    styling += width != "auto" ? (" w-" + width + " min-w-" + width) : "";
    styling += " " + className + " disabled:opacity-80";

    let submitting;
    let setSubmitting;
    const [submittingTemp, setSubmittingTemp] = useState(false);
    if (buttonSubmissionState === undefined) {
        submitting = submittingTemp;
        setSubmitting = setSubmittingTemp;
    }
    else {
        submitting = buttonSubmissionState;
        setSubmitting = () => {};
    }

    

    return (
        <div>
            <button onClick={(evt) => {
                //if the button is a submission button, then make
                //sure the submission function is run once.
                //Otherwise, it can be run multiple times.
                if (!submitting && submissionButton) {
                    onClick(evt);
                    if (submissionButton) setSubmitting(true);
                }
                else {
                    onClick(evt);
                }
            }} className={styling} disabled={disabled || submitting}>
                {submitting ? submissionText : text}
            </button>
        </div>
    );
}