import { Chat } from "./chats";

export class ChatButtonGroup {

    constructor({chat, selected = false}: {chat: Chat, selected: boolean}) {
        this.chat = chat;
        this.selected = selected;
    }

    public chat: Chat;
    public selected = false;
}