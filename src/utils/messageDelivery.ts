import type { Message } from "@/lib/api/message";

export type ClientMessage = Message & {
  clientMessageId?: string;
  deliveryStatus?: "sending" | "sent";
};

export interface ReconciliationResult {
  messages: ClientMessage[];
  confirmedClientMessageId?: string;
}

function sortedFileIds(message: ClientMessage): string[] {
  return [...(message.fileIds ?? [])].sort();
}

function isSameConversation(
  first: ClientMessage,
  second: ClientMessage,
): boolean {
  const firstChatId = first.privateChat?.id ?? first.chat?.id;
  const secondChatId = second.privateChat?.id ?? second.chat?.id;
  return Boolean(firstChatId && firstChatId === secondChatId);
}

function isSamePayload(
  optimistic: ClientMessage,
  incoming: ClientMessage,
): boolean {
  if ((optimistic.content ?? "") !== (incoming.content ?? "")) return false;
  if (!isSameConversation(optimistic, incoming)) return false;

  const optimisticFiles = sortedFileIds(optimistic);
  const incomingFiles = sortedFileIds(incoming);
  if (
    optimisticFiles.length !== incomingFiles.length ||
    optimisticFiles.some((id, index) => id !== incomingFiles[index])
  ) {
    return false;
  }

  return (optimistic.replyTarget?.id ?? null) ===
    (incoming.replyTarget?.id ?? null);
}

/**
 * Reconciles the server broadcast with an optimistic message.
 *
 * New servers echo clientMessageId, which is the primary key. The payload
 * fallback keeps rolling deployments and lost ACKs safe: the oldest matching
 * optimistic message is confirmed instead of appending a duplicate.
 */
export function reconcileIncomingMessage(
  previous: ClientMessage[],
  incoming: ClientMessage,
  currentUserId?: string,
): ReconciliationResult {
  const serverMessageIndex = previous.findIndex(
    (message) => message.id === incoming.id,
  );

  let optimisticIndex = incoming.clientMessageId
    ? previous.findIndex(
        (message) =>
          message.deliveryStatus === "sending" &&
          message.clientMessageId === incoming.clientMessageId,
      )
    : -1;

  // Backward-compatible fallback for a server that saved the message but did
  // not echo clientMessageId or whose ACK was lost in transit.
  if (
    optimisticIndex === -1 &&
    incoming.sender?.id === currentUserId
  ) {
    optimisticIndex = previous.findIndex(
      (message) =>
        message.deliveryStatus === "sending" &&
        Boolean(message.clientMessageId) &&
        message.sender?.id === currentUserId &&
        isSamePayload(message, incoming),
    );
  }

  const confirmedClientMessageId =
    optimisticIndex === -1
      ? incoming.clientMessageId
      : previous[optimisticIndex].clientMessageId;

  if (serverMessageIndex !== -1) {
    if (optimisticIndex !== -1 && optimisticIndex !== serverMessageIndex) {
      return {
        messages: previous.filter((_, index) => index !== optimisticIndex),
        confirmedClientMessageId,
      };
    }
    return { messages: previous, confirmedClientMessageId };
  }

  if (optimisticIndex !== -1) {
    return {
      messages: previous.map((message, index) =>
        index === optimisticIndex
          ? {
              ...incoming,
              clientMessageId: confirmedClientMessageId,
              deliveryStatus: "sent",
            }
          : message,
      ),
      confirmedClientMessageId,
    };
  }

  return { messages: [...previous, incoming] };
}
