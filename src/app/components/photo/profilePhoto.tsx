import Image from "next/image"

export default function ProfilePhoto({photo = "", tSizeNumber=12, className="", title=""}) {

    let actualPhoto = photo == "" ? "/static/noPhoto.png" : photo;

    return (
        (tSizeNumber == 12 &&
        <div>
            <Image title={title} alt={""} className={"bg-cadet_gray-300 rounded-full border-solid border-1 border-cadet_gray-400 max-w-12 max-h-12 min-h-12 min-w-12" + " " + className} src={actualPhoto} width={48} height={48} style={{objectFit: "cover"}}></Image>
        </div>) ||

        (tSizeNumber == 10 && 
        <div>
            <Image title={title} alt={""} className={"bg-cadet_gray-300 rounded-full border-solid border-1 border-cadet_gray-400 max-w-10 max-h-10 min-h-10 min-w-10" + " " + className} src={actualPhoto} width={40} height={40} style={{objectFit: "cover"}}></Image>
        </div>
        ) ||

        (<div>
            <Image title={title} alt={""} className={"bg-cadet_gray-300 rounded-full border-solid border-1 border-cadet_gray-400 " + ("min-w-" + tSizeNumber) + (" max-w-" + tSizeNumber) + (" min-h-" + tSizeNumber) + (" max-h-" + tSizeNumber)  + " " + className} width={tSizeNumber * 4} height={tSizeNumber * 4} src={actualPhoto}></Image>
        </div>)


    )
}