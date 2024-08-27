'use client'
import Link from "next/link";
import { MouseEventHandler } from "react";

export default function Button({text = "this is button text", colorStyling, color, outline = false, size = "Large", width = "auto", onClick, selected = false, className = ""} : 
    {text: string, colorStyling: "Light"|"Heavy", color: "Grayscale"|"Primary"|"Secondary"|"PrimaryAlt"|"SecondaryAlt",
        outline?: boolean, size?: "Large"|"Small", width?: "auto"|number, onClick:MouseEventHandler, selected?: boolean, className?: string}) {

    let styling = "";
    let whenSelectedColor = "";
    let notSelectedColor = "";
    switch (color){
        case ("Grayscale"): {
            if (colorStyling == "Light"){
                styling = "hover:bg-cadet_gray-100 focus:bg-cadet_gray-200 active:bg-cadet_gray-200";
                whenSelectedColor = "bg-cadet_gray-200";
                notSelectedColor = "bg-cadet_gray-50";
                styling += outline ? " border-solid border-1 border-cadet_gray-200" : "";
            }
            else {
                styling = "hover:bg-cadet_gray focus:bg-cadet_gray-600 active:bg-cadet_gray-600";
                whenSelectedColor = "bg-cadet_gray-600";
                notSelectedColor = "bg-cadet_gray-400";
                styling += outline ? " border-solid border-1 border-cadet_gray-600" : "";
            }
            break;
        }
        case ("Primary"): {
            if (colorStyling == "Light"){
                styling = "hover:bg-persian_green-100 focus:bg-persian_green-200 active:bg-persian_green-200";
                whenSelectedColor = "bg-persian_green-200";
                notSelectedColor = "bg-persian_green-50";
                styling += outline ? " border-solid border-1 border-persian_green-200" : "";
            }
            else {
                styling = "hover:bg-persian_green focus:bg-persian_green-600 active:bg-persian_green-600";
                whenSelectedColor = "bg-persian_green-600";
                notSelectedColor = "bg-persian_green-400";
                styling += outline ? " border-solid border-1 border-persian_green-600" : "";
            }
            break;
        }
        case ("PrimaryAlt"): {
            if (colorStyling == "Light"){
                styling = "hover:bg-moss_green-100 focus:bg-moss_green-200 active:bg-moss_green-200";
                whenSelectedColor = "bg-moss_green-200";
                notSelectedColor = "bg-moss_green-50";
                styling += outline ? " border-solid border-1 border-moss_green-200" : "";
            }
            else {
                styling = "hover:bg-moss_green-500 focus:bg-moss_green-600 active:bg-moss_green-600";
                whenSelectedColor = "bg-moss_green-600";
                notSelectedColor = "bg-moss_green";
                styling += outline ? " border-solid border-1 border-moss_green-600" : "";
            }
            break;
        }
        case ("Secondary"): {
            if (colorStyling == "Light"){
                styling = "hover:bg-coral-100 focus:bg-coral-200 active:bg-coral-200";
                whenSelectedColor = "bg-coral-200";
                notSelectedColor = "bg-coral-50";
                styling += outline ? " border-solid border-1 border-coral-200" : "";
            }
            else {
                styling = "hover:bg-coral-500 focus:bg-coral-600 active:bg-coral-600";
                whenSelectedColor = "bg-coral-600";
                notSelectedColor = "bg-coral";
                styling += outline ? " border-solid border-1 border-coral-600" : "";
            }
            break;
        }
        case ("SecondaryAlt"): {
            if (colorStyling == "Light"){
                styling = "hover:bg-persian_orange-100 focus:bg-persian_orange-200 active:bg-persian_orange-200";
                whenSelectedColor = "bg-persian_orange-200";
                notSelectedColor = "bg-persian_orange-50";
                styling += outline ? " border-solid border-1 border-persian_orange-200" : "";
            }
            else {
                styling = "hover:bg-persian_orange-500 focus:bg-persian_orange-600 active:bg-persian_orange-600";
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
    styling += " " + className;

    return (
        <button onClick={(evt) => {onClick(evt)}} className={styling}>
            {text}
        </button>
    );
}