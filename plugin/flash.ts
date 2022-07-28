import { Mirai, Webhook } from "../deps.ts";
import { cacheMessage } from "../utils.ts";

/**
 * 把闪照提取出来
 */
export default (webhook: Webhook, mirai: Mirai) => {
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
      if (event.messageChain.some((value) => value.type === "FlashImage")) {
        mirai.sendGroupMessage({
          target: event.sender.group.id,
          messageChain: await cacheMessage(event.messageChain),
        });
      }
    });
};
