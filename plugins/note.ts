import {
  DeserializedMessage,
  IHelperReply,
  IMessageChain,
  IPlugin,
} from "../types.ts";

import { messageText, Storage } from "../utils.ts";

const storage = new Storage<string, IMessageChain>("note");

const helpText = `/note set xxx (回复)
/note append xxx (回复)
/note delete xxx
/note help
/note list`;

export const NotePlugin: IPlugin = {
  name: "note",
  helpText,
  onGroupMessage(
    helper: IHelperReply,
    gid: number,
    _uid: number,
    message: DeserializedMessage,
  ) {
    const text = messageText(message.messageChain);
    const list = text.split(" ").filter((a) => !!a);
    if (list[0] === "/note") {
      if (list.length < 2 || list[1] === "help") {
        helper.reply(helpText);
        return;
      }
      if (list[1] === "set") {
        if (!list[2]) {
          helper.reply("参数错误");
          return;
        }
        if (!message.quote) {
          helper.reply("请回复需要写入的内容");
          return;
        }
        storage.set(`${gid}.${list[2]}`, message.quote);
        helper.reply("添加成功");
        return;
      }
      if (list[1] === "append") {
        if (!list[2]) {
          helper.reply("参数错误");
          return;
        }
        if (!message.quote) {
          helper.reply("请回复需要写入的内容");
          return;
        }
        const last = storage.get(`${gid}.${list[2]}`) ?? [];
        storage.set(`${gid}.${list[2]}`, last.concat(message.quote));
        helper.reply("更新成功");
        return;
      }
      if (list[1] === "get") {
        if (!list[2]) {
          helper.reply("参数错误");
          return;
        }
        const note = storage.get(`${gid}.${list[2]}`);
        if (typeof note === "string") {
          helper.reply(note);
        } else {
          helper.reply(`找不到 ${list[2]}`);
        }
        return;
      }
      if (list[1] === "delete") {
        if (!list[2]) {
          helper.reply("参数错误");
          return;
        }
        const success = storage.delete(`${gid}.${list[2]}`);
        helper.reply(success ? "删除成功" : "删除失败");
        return;
      }
      if (list[1] === "list") {
        const header = `${gid}.`;
        const data = storage.keys().map((key) => {
          return key.startsWith(header) ? key.slice(header.length) : "";
        }).filter((a) => !!a);
        const message = data.length ? data.join("\n") : "没有 note";
        helper.reply(message);
        return;
      }
      helper.reply(helpText);
      return;
    }

    const note = storage.get(`${gid}.${text}`);
    if (note) {
      helper.reply(note);
      return;
    }
  },
};
