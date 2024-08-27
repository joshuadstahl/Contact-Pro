import { createContext } from "react";
import { User, userStatus } from "../util/classes";

export const CurrentUserContext = createContext<User>(new User({name: "NA", photo:"photo", email:"blabla@gmail.com", status: userStatus.OFFLINE, username:"0"}));