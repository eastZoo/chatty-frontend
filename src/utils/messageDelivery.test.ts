import { describe, expect, it } from "vitest";
import {
  reconcileIncomingMessage,
  type ClientMessage,
} from "./messageDelivery";

const currentUserId = "me";
const chatId = "chat-1";

function optimistic(
  clientMessageId: string,
  content = "same content",
): ClientMessage {
  return {
    id: `optimistic:${clientMessageId}`,
    clientMessageId,
    deliveryStatus: "sending",
    content,
    sender: { id: currentUserId, username: "me" },
    privateChat: { id: chatId },
    fileIds: [],
  };
}

function confirmed(
  id: string,
  content = "same content",
  clientMessageId?: string,
): ClientMessage {
  return {
    id,
    clientMessageId,
    content,
    sender: { id: currentUserId, username: "me" },
    privateChat: { id: chatId },
    fileIds: [],
  };
}

describe("reconcileIncomingMessage", () => {
  it("replaces the optimistic row when the server echoes clientMessageId", () => {
    const result = reconcileIncomingMessage(
      [optimistic("client-1")],
      confirmed("server-1", "same content", "client-1"),
      currentUserId,
    );

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0]).toMatchObject({
      id: "server-1",
      clientMessageId: "client-1",
      deliveryStatus: "sent",
    });
    expect(result.confirmedClientMessageId).toBe("client-1");
  });

  it("reconciles a legacy/no-ACK server broadcast by payload", () => {
    const result = reconcileIncomingMessage(
      [optimistic("client-1")],
      confirmed("server-1"),
      currentUserId,
    );

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0]).toMatchObject({
      id: "server-1",
      clientMessageId: "client-1",
      deliveryStatus: "sent",
    });
    expect(result.confirmedClientMessageId).toBe("client-1");
  });

  it("matches repeated identical sends in FIFO order", () => {
    const result = reconcileIncomingMessage(
      [optimistic("client-1"), optimistic("client-2")],
      confirmed("server-1"),
      currentUserId,
    );

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0]).toMatchObject({
      id: "server-1",
      clientMessageId: "client-1",
      deliveryStatus: "sent",
    });
    expect(result.messages[1]).toMatchObject({
      id: "optimistic:client-2",
      deliveryStatus: "sending",
    });
  });

  it("never consumes an optimistic row for another sender", () => {
    const incoming: ClientMessage = {
      ...confirmed("server-other"),
      sender: { id: "other", username: "other" },
    };
    const result = reconcileIncomingMessage(
      [optimistic("client-1")],
      incoming,
      currentUserId,
    );

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].deliveryStatus).toBe("sending");
    expect(result.messages[1].id).toBe("server-other");
  });

  it("removes a stale optimistic duplicate if the server row already exists", () => {
    const serverMessage = confirmed("server-1", "same content", "client-1");
    const result = reconcileIncomingMessage(
      [serverMessage, optimistic("client-1")],
      serverMessage,
      currentUserId,
    );

    expect(result.messages).toEqual([serverMessage]);
    expect(result.confirmedClientMessageId).toBe("client-1");
  });
});
