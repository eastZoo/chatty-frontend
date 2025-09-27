// src/state/atoms.ts
import { atom } from "recoil";
import { type Chat } from "@/lib/api/chat";

export const selectedChatState = atom<Chat | null>({
  key: "selectedChatState",
  default: null,
});
