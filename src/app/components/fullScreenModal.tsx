import useDelayedClassToggler from "../hooks/useDelayedClassToggler";

export default function FullScreenModal({children, shown}: Readonly<{children: React.ReactNode, shown: boolean}>) {

    const [backdropRender, backdropCurrentClass] = useDelayedClassToggler(["modalBackdropShow", ""], shown, 500);
    const [modalRender, modalCurrentClass] = useDelayedClassToggler(["modalShow", ""], shown, 500);

    return (
        <div>
            {shown && backdropRender && <div className={"fixed flex flex-row wrap-none items-center h-full max-h-full w-full max-w-full overflow-hidden z-10 bg-black opacity-50 backdrop-blur-xl modalBackdrop " + backdropCurrentClass}>
            </div>}
            {shown && modalRender && <div className={"fixed flex flex-row wrap-none items-center h-full max-h-full w-full max-w-full overflow-hidden z-20 modal " + modalCurrentClass }>
                {children}
            </div>}
        </div>
    )
}