import { createContext } from "react";
import { userRepository } from "@/app/app/page";

export const UserRepositoryContext = createContext<userRepository>({});