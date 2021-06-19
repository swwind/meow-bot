import { DeserializedMessage, IHelperReply, IPlugin } from "../types.ts";
import { messageText } from "../utils.ts";

const helpText = "来点涩图";

/*
function fetchSetu(timeout = 10000) {
  return Promise.race([
    new Promise<string>((_, reject) => setTimeout(reject, timeout)),
    (async () => {
      const response = await fetch(
        "https://api.lovemiku.online/miku/?master=1",
      );
      const json = await response.json();
      const url: string = json?.url;
      if (!url || typeof url !== "string") {
        throw new Error("API error");
      }
      return url;
    })(),
  ]);
}
*/

export const SetuPlugin: IPlugin = {
  name: "setu",
  helpText,
  async onGroupMessage(
    helper: IHelperReply,
    _gid: number,
    _uid: number,
    message: DeserializedMessage,
  ) {
    const text = messageText(message.messageChain);
    if (text === "来点涩图") {
      try {
        let setus: string[] = [];
        for await (const entry of Deno.readDir("/root/setu")) {
          if (entry.isFile && /\.(?:jpe?g|png)$/i.test(entry.name)) {
            setus.push(entry.name);
          }
        }
        if (!setus.length) {
          throw new Error();
        }
        const setu = setus[Math.floor(Math.random() * setus.length)];
        helper.reply([{
          type: "Image",
          url: `file:///root/setu/${setu}`,
        }]);
      } catch (e) {
        helper.reply("获取涩图失败");
      }
      return;
    }
  },
  onFriendMessage(
    helper: IHelperReply,
    _uid: number,
    message: DeserializedMessage,
  ) {
    const text = messageText(message.messageChain);
    if (text === "来点涩图") {
      helper.reply("别冲了");
      return;
    }
  },
};
