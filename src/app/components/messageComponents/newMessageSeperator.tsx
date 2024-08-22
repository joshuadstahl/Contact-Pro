export default function NewMessageSeperator() {
   
    return (
        <div id={"newMessagesSep"} className="flex flex-row flex-nowrap items-center mt-1.5 mb-5">
            <div className="grow h-0 border-1 border-persian_orange" ></div>
            <i className="bi bi-arrow-down-short stroke-1 text-persian_orange mx-5"></i>
            <p className="px-5 py-1.5 rounded-my bg-persian_orange-300 text-xs font-light text-coral-950 leading-none text-center">New Messages</p>
            <i className="bi bi-arrow-down-short stroke-1 text-persian_orange mx-5"></i>
            <div className="grow h-0 border-1 border-persian_orange"></div>
        </div>
    )
}