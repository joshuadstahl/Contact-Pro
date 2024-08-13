import { createContext } from "react";
import { User, userStatus } from "../util/classes";

export const CurrentUserContext = createContext(new User({name: "NA", photo:"photo", status: userStatus.OFFLINE, userID:"0"}));