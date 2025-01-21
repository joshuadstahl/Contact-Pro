

export default function ToggleButton({size = "Large", leftButtonText, rightButtonText, leftButtonSelected = true, leftButtonNotifyCount, rightButtonNotifyCount, leftButtonOnClick, rightButtonOnClick, fullWidth = true}: {size?: "Large"|"XS", leftButtonText: string, rightButtonText: string, leftButtonSelected: boolean, leftButtonNotifyCount: number, rightButtonNotifyCount: number, leftButtonOnClick: () => void, rightButtonOnClick: () => void, fullWidth?: boolean}) {
    let buttonSizing = "rounded-5px";
    let outerDivSizing = "rounded-5px";

    if (size == "Large") {
        buttonSizing += " px-5 py-2.5 text-sm";
        outerDivSizing += " p-2.5";
    }
    else if (size == "XS") {
        buttonSizing += " px-2.5 py-1.5 text-xs";
        outerDivSizing += " p-1.5";
    }

    let bubbleSizing = "";
    let bubbleTextSize = "";
    if (size == "Large") {
        bubbleSizing = " size-5";
        bubbleTextSize = " text-[0.75rem] leading-[1.25rem] -mb-[0.06rem]";
    }
    else {
        bubbleSizing = " size-[1.125rem]";
        bubbleTextSize = " text-[0.625rem] leading-[1.125rem] -mb-[0.09868rem]";
    }

    let leftButtonStyling = buttonSizing;
    let rightButtonStyling = buttonSizing;

    if (leftButtonSelected) {
        leftButtonStyling += " bg-cadet_gray-300 font-semibold";
        rightButtonStyling += " bg-cadet_gray-200";
    }
    else {
        leftButtonStyling += " bg-cadet_gray-200";
        rightButtonStyling += " bg-cadet_gray-300 font-semibold";
    }

    let buttonSpacing = "mr-[5px]"; //default spacing is for Large size
    if (size == "XS") {
        buttonSpacing = "mr-1";
    }

    return (
        <div className={outerDivSizing + (fullWidth ? " flex flex-row flex-nowrap " : " w-fit ") + "items-left bg-cadet_gray-200"}>
            <div className={"flex flex-row flex-nowrap items-center " + buttonSpacing + (fullWidth ? "" : " float-left")}>
                <button onClick={leftButtonOnClick} className={leftButtonStyling + (leftButtonNotifyCount !>= 0 ? " flex flex-row flex-nowrap items-center" : "")}>
                    {leftButtonText}
                    {leftButtonNotifyCount > 0 &&
                    <div className={"flex items-center justify-center " +
                    "rounded-full bg-persian_orange ml-2.5 shadow-notify" + bubbleSizing}>
                        <span className={"inline-block text-center align-middle text-white" + bubbleTextSize}>{leftButtonNotifyCount > 9 ? "9+": leftButtonNotifyCount}</span>
                    </div>
                    }
                </button>
            
            </div>
            <div className="flex flex-row flex-nowrap items-center">
                <button onClick={rightButtonOnClick} className={rightButtonStyling + (rightButtonNotifyCount !>= 0 ? " flex flex-row flex-nowrap items-center" : "")}>
                    {rightButtonText}
                    {rightButtonNotifyCount > 0 &&
                    <div className={"flex items-center justify-center " +
                    "rounded-full bg-persian_orange ml-2.5 shadow-notify" + bubbleSizing}>
                        <span className={"inline-block text-center align-middle text-white" + bubbleTextSize}>{rightButtonNotifyCount > 9 ? "9+": rightButtonNotifyCount}</span>
                    </div>
                    }
                </button>
            
            </div>
            {/* <button onClick={leftButtonOnClick} className={leftButtonStyling}>{leftButtonText}</button>
            <button onClick={rightButtonOnClick} className={rightButtonStyling}>{rightButtonText}</button> */}
        </div>
    )
}