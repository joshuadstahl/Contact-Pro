export default function Copyright({position = "left"}) {

    let classNames = "";
    if (position == "center") {
        classNames = "text-center";
    }
    else if (position == "left") {
        classNames = "text-left";
    }
    else if (position == "right") {
        classNames = "text-right";
    }
    else {
        classNames = "text-left";
    }

    return (
        <div className="shrink-0">
            <p className={"font-light text-xs " + classNames}>Contact Pro © 2024 - Joshua Stahl</p>
        </div>
    );
}