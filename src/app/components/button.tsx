'use client'

import Link from "next/link";
export default function Button({text = "this is button text", selected = false, onClick=() => {}}) {

    let css = "w-min hover:bg-cadet_gray-200 focus:bg-cadet_gray-300 active:bg-cadet_gray-300 rounded-my";
    if (selected == true) {
        css += " bg-cadet_gray-300";
    }    

    return (
    <Link href="" onClick={onClick} className={css}>
        <div className="px-5 py-2.5">
            <p className="text-sm text-center text-persian_green text-nowrap leading-none">{text}</p>
        </div>
    </Link>
    );
}