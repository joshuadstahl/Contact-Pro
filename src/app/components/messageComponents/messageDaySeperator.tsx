export default function MessageDaySeperator({day = ""}: {day: string}) {

    return (
        <div className="flex flex-row flex-nowrap items-center mt-5">
            <div className="grow h-0 border-1 border-cadet_gray-300" ></div>
            <div className="mx-5 p-2.5 rounded-my bg-cadet_gray-200 text-xs text-charcoal-950 leading-none">{day}</div>
            <div className="grow h-0 border-1 border-cadet_gray-300"></div>
        </div>
    )
}