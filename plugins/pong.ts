import { DeserializedMessage, IHelper, IPlugin } from "../types.ts";
import { messageText } from "../utils.ts";

export const PongPlugin: IPlugin = {
  initialize(ws: IHelper) {
  },
  onGroupMessage(
    ws: IHelper,
    gid: number,
    uid: number,
    message: DeserializedMessage,
  ) {
    const text = messageText(message.messageChain);
    if (text === "ping") {
      ws.sendGroupMessage(gid, "pong");
      return;
    }
  },
  onFriendMessage(ws: IHelper, uid: number, message: DeserializedMessage) {
    const text = messageText(message.messageChain);
    if (text === "ping") {
      ws.sendFriendMessage(uid, "pong");
      return;
    }
  },
};
