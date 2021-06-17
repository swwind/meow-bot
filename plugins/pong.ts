import { DeserializedMessage, IHelper, IPlugin } from "../types.ts";
import { messageText } from "../utils.ts";

const helpText = "直接发送 ping";

export const PongPlugin: IPlugin = {
  name: "ping",
  helpText,
  onGroupMessage(
    ws: IHelper,
    gid: number,
    _uid: number,
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
