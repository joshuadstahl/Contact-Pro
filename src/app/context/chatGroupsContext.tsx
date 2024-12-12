import { createContext } from "react";
import { ChatButtonGroup } from "@/app/classes/chatButtonGroup";

export const ChatGroupsContext = createContext<Array<ChatButtonGroup>>(new Array<ChatButtonGroup>);