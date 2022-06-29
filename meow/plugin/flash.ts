import { Plugin } from "../../mod.ts";
import { cacheMessage, } from "../utils.ts";

const flash: Plugin = (webhook, http) => {
  webhook
    .pipe((event) =>
      event.type === "GroupMessage" || event.type === "GroupSyncMessage" ||
        event.type === "TempMessage" || event.type === "TempSyncMessage"
        ? [event]
        : null
    )
    .attach(async (event) => {
      if (event.messageChain.some((value) => value.type === "FlashImage")) {
        http.sendGroupMessage({
          target: event.sender.group.id,
          messageChain: await cacheMessage(event.messageChain),
        })
      }
    });
};

export default flash;
