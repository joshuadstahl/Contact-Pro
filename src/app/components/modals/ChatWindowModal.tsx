import useDelayedClassToggler from "../../hooks/useDelayedClassToggler";
import FullScreenModal from "./fullScreenModal";


export default function ChatWindowModal({children, shown, backdrop = true, delayShow = 200, delayHide = 500}: Readonly<{children: React.ReactNode, shown: boolean, backdrop?:boolean, delayShow?:number, delayHide?:number}>) {

    const [backdropRender, backdropCurrentClass] = useDelayedClassToggler(["modalBackdropShow", ""], shown, delayShow, delayHide);
    const [modalRender, modalCurrentClass] = useDelayedClassToggler(["modalShow", ""], shown, delayShow, delayHide);

    return (
        <div className={"absolute inset-0 " + (modalRender ? "" : "hidden")}>
            <div className="relative h-full max-h-full w-full max-w-full">
                {backdropRender && backdrop && <div className={"absolute flex flex-row wrap-none items-center h-full max-h-full w-full max-w-full overflow-hidden z-10 bg-black opacity-50 backdrop-blur-xl modalBackdrop rounded-r-my " + backdropCurrentClass}>
                </div>}
                {modalRender && <div className={"absolute flex flex-row wrap-none items-center h-full max-h-full w-full max-w-full overflow-hidden z-20 modal rounded-r-my " + modalCurrentClass }>
                    {children}
                </div>}
            </div>
        </div>
    )
}