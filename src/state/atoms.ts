// src/state/atoms.ts
import { atom } from "recoil";
import { Chat } from "../api/chat";

export const selectedChatState = atom<Chat | null>({
  key: "selectedChatState",
  default: null,
});
