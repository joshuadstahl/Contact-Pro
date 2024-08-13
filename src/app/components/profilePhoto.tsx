export default function ProfilePhoto({photo = "", tSizeNumber=12}) {


    return (
        (tSizeNumber == 12 &&
        <div>
            <img className={"bg-cadet_gray-300 rounded-full border-solid border-1 border-cadet_gray-400 max-w-12 max-h-12 min-h-12 min-w-12"} src={photo}></img>
        </div>) ||

        (tSizeNumber == 10 && 
        <div>
            <img className={"bg-cadet_gray-300 rounded-full border-solid border-1 border-cadet_gray-400 max-w-10 max-h-10 min-h-10 min-w-10"} src={photo}></img>
        </div>
        ) ||

        (<div>
            <img className={"bg-cadet_gray-300 rounded-full border-solid border-1 border-cadet_gray-400 " + ("min-w-" + tSizeNumber) + (" max-w-" + tSizeNumber) + (" min-h-" + tSizeNumber) + (" max-h-" + tSizeNumber)} src={photo}></img>
        </div>)


    )
}