import { userStatus } from "./classes";

export function GetColorClass(status: userStatus) : string {
    if (status == userStatus.ONLINE) {
        return "bg-online_green";
    }
    else if (status == userStatus.DO_NOT_DISTURB) {
        return "bg-do_not_disturb";
    }
    else {
        return "bg-offline_grey";
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