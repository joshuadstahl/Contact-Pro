import useDelayedClassToggler from "../hooks/useDelayedClassToggler";

export default function FullScreenModal({children, shown, backdrop = true, delayShow = 200, delayHide = 500}: Readonly<{children: React.ReactNode, shown: boolean, backdrop?:boolean, delayShow?:number, delayHide?:number}>) {

    const [backdropRender, backdropCurrentClass] = useDelayedClassToggler(["modalBackdropShow", ""], shown, delayShow, delayHide);
    const [modalRender, modalCurrentClass] = useDelayedClassToggler(["modalShow", ""], shown, delayShow, delayHide);

    return (
        <div>
            {backdropRender && backdrop && <div className={"fixed flex flex-row wrap-none items-center h-full max-h-full w-full max-w-full overflow-hidden z-10 bg-black opacity-50 backdrop-blur-xl modalBackdrop " + backdropCurrentClass}>
            </div>}
            {modalRender && <div className={"fixed flex flex-row wrap-none items-center h-full max-h-full w-full max-w-full overflow-hidden z-20 modal " + modalCurrentClass }>
                {children}
            </div>}
        </div>
    )
}