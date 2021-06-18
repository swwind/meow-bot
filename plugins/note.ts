import {
  DeserializedMessage,
  IHelperReply,
  IMessageChain,
  IPlugin,
} from "../types.ts";

import { getCollection, messageText } from "../utils.ts";

interface NoteSchema {
  gid: number;
  uid: number;
  name: string;
  note: string;
}

const collection = getCollection<NoteSchema>("note");

const helpText = `/note set xxx (回复)
/note append xxx (回复)
/note delete xxx
/note help
/note list`;

async function getNote(
  gid: number,
  name: string,
): Promise<IMessageChain | undefined> {
  const findRes = await collection.findOne({ gid, name });
  if (findRes) {
    try {
      const oldnote = JSON.parse(findRes.note);
      if (Array.isArray(oldnote)) {
        return oldnote;
      }
    } catch (e) {
      // failed
    }
  }
  return;
}

export const NotePlugin: IPlugin = {
  name: "note",
  helpText,
  async onGroupMessage(
    helper: IHelperReply,
    gid: number,
    _uid: number,
    message: DeserializedMessage,
  ) {
    const text = messageText(message.messageChain);
    const [command, subcommand, name] = text.split(" ", 3);

    if (command === "/note") {
      if (subcommand === "set") {
        if (!name) {
          helper.reply("缺少参数");
          return;
        }
        if (!message.quote) {
          helper.reply("请回复需要写入的内容");
          return;
        }
        const note = JSON.stringify(message.quote);
        await collection.updateOne({ gid, name }, { $set: { note } }, {
          upsert: true,
        });
        helper.reply("添加成功");
        return;
      }

      if (subcommand === "append") {
        if (!name) {
          helper.reply("缺少参数");
          return;
        }
        if (!message.quote) {
          helper.reply("请回复需要写入的内容");
          return;
        }

        const oldnote = await getNote(gid, name) ?? [];
        const note = JSON.stringify(oldnote.concat(message.quote));

        await collection.updateOne({ gid, name }, { $set: { note } }, {
          upsert: true,
        });
        helper.reply("更新成功");
        return;
      }

      if (subcommand === "get") {
        if (!name) {
          helper.reply("缺少参数");
          return;
        }

        const oldnote = await getNote(gid, name);

        if (oldnote) {
          helper.reply(oldnote);
        } else {
          helper.reply(`找不到 ${name}`);
        }
        return;
      }

      if (subcommand === "delete") {
        if (!name) {
          helper.reply("参数错误");
          return;
        }
        const success = await collection.deleteOne({ gid, name });
        helper.reply(success > 0 ? "删除成功" : "删除失败");
        return;
      }

      if (subcommand === "list") {
        const data = await collection.find({ gid }).map((item) => item.name);
        helper.reply(data.length ? data.join("\n") : "没有 note");
        return;
      }

      helper.reply("/help note");
      return;
    }

    const note = await getNote(gid, text);
    if (note) {
      helper.reply(note);
      return;
    }
  },
};
