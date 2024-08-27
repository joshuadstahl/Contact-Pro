import Image from "next/image"

export default function ProfilePhoto({photo = "", tSizeNumber=12}) {

    let actualPhoto = photo == "" ? "/static/noPhoto.png" : photo;

    return (
        (tSizeNumber == 12 &&
        <div>
            <Image alt={""} className={"bg-cadet_gray-300 rounded-full border-solid border-1 border-cadet_gray-400 max-w-12 max-h-12 min-h-12 min-w-12"} src={actualPhoto} width={48} height={48} style={{objectFit: "cover"}}></Image>
        </div>) ||

        (tSizeNumber == 10 && 
        <div>
            <Image alt={""} className={"bg-cadet_gray-300 rounded-full border-solid border-1 border-cadet_gray-400 max-w-10 max-h-10 min-h-10 min-w-10"} src={actualPhoto} width={40} height={40} style={{objectFit: "cover"}}></Image>
        </div>
        ) ||

        (<div>
            <Image alt={""} className={"bg-cadet_gray-300 rounded-full border-solid border-1 border-cadet_gray-400 " + ("min-w-" + tSizeNumber) + (" max-w-" + tSizeNumber) + (" min-h-" + tSizeNumber) + (" max-h-" + tSizeNumber)} width={tSizeNumber * 4} height={tSizeNumber * 4} src={actualPhoto}></Image>
        </div>)


    )
}