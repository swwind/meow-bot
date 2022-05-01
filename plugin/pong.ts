import { Http } from "../http.ts";
import { MessagePlain } from "../mirai/chain.ts";
import { Webhook } from "../webhook.ts";

export default (webhook: Webhook, http: Http) => {
  webhook
    .pipe(event => event.type === "FriendMessage" || event.type === "FriendSyncMessage" ? [event] : null)
    .attach(event => {
      const message = event.messageChain
        .filter((msg): msg is MessagePlain => msg.type === "Plain")
        .map(msg => msg.text)
        .join(" ");

      if (message === "/ping") {
        http.sendFriendMessage({
          target: event.sender.id,
          messageChain: [{
            type: 'Plain',
            text: 'pong'
          }]
        })
      }
    })
}