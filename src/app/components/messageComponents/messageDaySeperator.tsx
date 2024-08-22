export default function MessageDaySeperator({day = ""}: {day: string}) {

    return (
        <div className="flex flex-row flex-nowrap items-center mt-5">
            <div className="grow h-0 border-1 border-cadet_gray-300" ></div>
            <p className="mx-5 px-5 py-1.5 rounded-my bg-cadet_gray-200 text-xs font-light text-charcoal-950 leading-none text-center">{day}</p>
            <div className="grow h-0 border-1 border-cadet_gray-300"></div>
        </div>
    )
}