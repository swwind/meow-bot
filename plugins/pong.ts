import { DeserializedMessage, IHelperReply, IPlugin } from "../types.ts";
import { messageText } from "../utils.ts";

const helpText = "/ping";

export const PongPlugin: IPlugin = {
  name: "ping",
  helpText,
  onAllMessage(
    helper: IHelperReply,
    _gid: number,
    _uid: number,
    message: DeserializedMessage,
  ) {
    const text = messageText(message.messageChain);
    if (text === "/ping") {
      helper.reply(Math.random() < .01 ? "ping 你🐴呢" : "pong");
      return;
    }
  },
};
