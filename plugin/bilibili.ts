import { Webhook, Mirai, MessageApp } from "../deps.ts";

export default (webhook: Webhook, mirai: Mirai) => {
  webhook
    .pipe((event) =>
      event.type === "GroupMessage" || event.type === "GroupSyncMessage"
        ? [event]
        : null
    )
    .attach((event) => {
      const message = event.messageChain.find(
        (message): message is MessageApp => message.type === "App"
      );

      if (message) {
        const content = JSON.parse(message.content);
        if (content?.meta?.detail_1?.title === "1109937557") {
          const url = content?.meta?.detail_1?.qqdocurl;
          if (typeof url === "string") {
            const index = url.indexOf("?");
            const cleanurl = index > -1 ? url.substring(0, index) : url;
            mirai.sendGroupMessage({
              target: event.sender.group.id,
              messageChain: [{ type: "Plain", text: cleanurl }],
            });
          }
        }
      }
    });
};
