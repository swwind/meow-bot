import { Mirai, Webhook } from "../deps.ts";
import { extractText } from "../utils.ts";

export default (webhook: Webhook, mirai: Mirai) => {
  webhook
    .pipe((event) =>
      event.type === "FriendMessage" ||
      event.type === "FriendSyncMessage" ||
      event.type === "StrangeMessage" ||
      event.type === "StrangeSyncMessage"
        ? [event]
        : null
    )
    .attach(async (event) => {
      const message = extractText(event.messageChain);

      if (message === "/ping") {
        await mirai.sendFriendMessage({
          target: event.sender.id,
          messageChain: [
            {
              type: "Plain",
              text: "pong",
            },
          ],
        });
      }
    });

  webhook
    .pipe((event) =>
      event.type === "GroupMessage" ||
      event.type === "GroupSyncMessage" ||
      event.type === "TempMessage" ||
      event.type === "TempSyncMessage"
        ? [event]
        : null
    )
    .attach(async (event) => {
      const message = extractText(event.messageChain);

      if (message === "/ping") {
        await mirai.sendGroupMessage({
          target: event.sender.group.id,
          messageChain: [
            {
              type: "Plain",
              text: "pong",
            },
          ],
        });
      }
    });
};
