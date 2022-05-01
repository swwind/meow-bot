import { Plugin } from "../../mod.ts";
import { extractText } from "../utils.ts";

const pong: Plugin = (webhook, http) => {
  webhook
    .pipe((event) =>
      event.type === "FriendMessage" || event.type === "FriendSyncMessage" ||
        event.type === "StrangeMessage" || event.type === "StrangeSyncMessage"
        ? [event]
        : null
    )
    .attach(async (event) => {
      const message = extractText(event.messageChain);

      if (message === "/ping") {
        await http.sendFriendMessage({
          target: event.sender.id,
          messageChain: [{
            type: "Plain",
            text: "pong",
          }],
        });
      }
    });

  webhook
    .pipe((event) =>
      event.type === "GroupMessage" || event.type === "GroupSyncMessage" ||
        event.type === "TempMessage" || event.type === "TempSyncMessage"
        ? [event]
        : null
    )
    .attach(async (event) => {
      const message = extractText(event.messageChain);

      if (message === "/ping") {
        await http.sendGroupMessage({
          target: event.sender.group.id,
          messageChain: [{
            type: "Plain",
            text: "pong",
          }],
        });
      }
    });
};

export default pong;
