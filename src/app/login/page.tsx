'use client'
import { Assistant } from "next/font/google";
import Image from "next/image";
import { useState } from "react";
import Copyright from "../components/copyright";

const assistant = Assistant(
    { 
        subsets: ["latin"]
    }
);

export default function App() {


  return (
    <div className="top-0 bottom-0 left-0 right-0 absolute flex flex-col wrap-none items-center p-2.5 h-dvh overflow-hidden">

        <div className="flex flex-row wrap-none items-center grow ">
            <div className="border border-cadet_gray-300 rounded-my px-28 py-8 bg-ghost_white">
                <h1 className="font-medium text-3xl text-center text-persian_green leading-none">Sign in to</h1>
                <h2 className={assistant.className + " text-3xl	text-center font-bold text-persian_green leading-none mb-16"}>Contact Pro</h2>
            </div>
        </div>
        <div className="flex flex-col wrap-none min-w-full ">
            <Copyright position="right"/>
        </div>
        
    </div>
    
  );
}
