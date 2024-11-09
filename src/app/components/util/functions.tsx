import { userStatus } from "@/app/classes/user";
import { RandomWordOptions, generateSlug } from "random-word-slugs";

//returns the color class name for a userStatus
export function GetColorBgClass(status: userStatus) : string {
    if (status == userStatus.ONLINE) {
        return "bg-online_green";
    }
    else if (status == userStatus.DO_NOT_DISTURB) {
        return "bg-do_not_disturb";
    }
    else {
        return "bg-offline_gray";
    }
}

export function GetColorTextClass(status: userStatus): string {
    if (status == userStatus.ONLINE) {
        return "text-online_green";
    }
    else if (status == userStatus.DO_NOT_DISTURB) {
        return "text-do_not_disturb";
    }
    else {
        return "text-offline_gray";
    }
}

//returns the appropriate text description for a userStatus
export function GetStatusName(status: userStatus) : string {
    if (status == userStatus.ONLINE) {
        return "Online";
    }
    else if (status == userStatus.DO_NOT_DISTURB) {
        return "Do Not Disturb";
    }
    else {
        return "Offline";
    }
}

// turns a date object into a fancy date.
// For example yesterday will be "Yesterday", and today will be "Today"
// Everything else will be a normal date in MM/DD/YYYY
export function GetFancyDate(theDate: Date) {
    let currDate = new Date();
    return ((currDate.toLocaleDateString() == theDate.toLocaleDateString() && "Today")
    ||
    (currDate.getMonth() == theDate.getMonth() &&
    currDate.getFullYear() == theDate.getFullYear() &&
    currDate.getDate() == theDate.getDate() + 1 &&
    "Yesterday"
    )
    ||
    (theDate.toLocaleDateString()))
}

export function GetFancyTime(timestamp: Date) {
    let msgTime = timestamp.toTimeString();
    msgTime = msgTime.substring(0, 5);
    let hours = timestamp.getHours();

    if (hours < 10) {
        msgTime = msgTime.substring(1, 5);
    }

    if (hours == 0) {
        msgTime = "12:" + timestamp.getMinutes().toString().padStart(2, '0');
    }

    if (hours < 12) {
        msgTime += " AM";
    }
    else if (hours == 12) {
        msgTime += " PM";
    } 
    else {
        msgTime = hours-12 + ":" + timestamp.getMinutes().toString().padStart(2, "0") + " PM";
    }

    return msgTime;
}

//generates a random username
export function randomUsername(): string {
    const options: RandomWordOptions<2> = {
        format: "camel",
        partsOfSpeech: ["adjective", "noun"],
        categories: {
            adjective: ["color", "appearance"],
            noun: ["animals", "food"]
        }
    }
    let slug = generateSlug(2, options); //generate the two words together
    slug = slug.charAt(0).toUpperCase() + slug.slice(1); //uppercase the first letter
    const num = Math.round(Math.random() * 1000); //generate the random 3 numbers at the end
    let num2 = num.toString().padStart(3, "0"); //pad the random 3 numbers with 0s

    return slug + num2;
}