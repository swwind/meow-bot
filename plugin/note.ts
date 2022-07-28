import { db } from "../db.ts";
import { MessageChain, MessageQuote, Mirai, Webhook } from "../deps.ts";
import { cacheMessage, extractText } from "../utils.ts";

type Note = {
  group: number;
  name: string;
  content: MessageChain[];
};

const coll = db.collection<Note>("notes");

await coll.createIndexes({
  indexes: [
    {
      key: {
        group: 1,
        name: 1,
      },
      name: "key",
      unique: true,
    },
  ],
});

async function addNote(group: number, name: string, content: MessageChain[]) {
  await coll.updateOne(
    { group, name },
    { $set: { content } },
    { upsert: true },
  );
}

async function getNote(group: number, name: string) {
  const note = await coll.findOne({
    group,
    name,
  });
  return note ? note.content : [];
}

const help = {
  add: "/note add <name> (内容使用回复方式指定)",
  append: "/note append <name> (内容使用回复方式指定)",
  list: "/note list",
  delete: "/note delete <name>",
};

export default (webhook: Webhook, mirai: Mirai) => {
  webhook
    .pipe((event) =>
      event.type === "GroupMessage" || event.type === "GroupSyncMessage"
        ? [event]
        : null
    )
    .attach(async (event) => {
      const message = extractText(event.messageChain);
      const command = message.split(" ").filter((s) => s !== "");

      const reply = (message: string | MessageChain) =>
        mirai.sendGroupMessage({
          target: event.sender.group.id,
          messageChain: typeof message === "string"
            ? [
              {
                type: "Plain",
                text: message,
              },
            ]
            : message,
        });

      const result = await coll.findOne({
        group: event.sender.group.id,
        name: message,
      });

      if (result) {
        for (const message of result.content) {
          await reply(message);
        }
      }

      if (command[0] === "/note") {
        // 添加备忘录
        if (command[1] === "add") {
          const name = command[2].trim();
          const quote = event.messageChain.filter(
            (msg): msg is MessageQuote => msg.type === "Quote",
          );

          if (!name || !quote.length) {
            return await reply(help.add);
          }

          const content = await cacheMessage(
            (
              await mirai.messageFromId(quote[0].id)
            ).data.messageChain,
          );

          await addNote(event.sender.group.id, name, [content]);

          await reply(`成功添加至「${name}」备忘喵`);
        } // 追加备忘录，如果不存在就直接创建
        else if (command[1] === "append") {
          const name = command[2].trim();
          const quote = event.messageChain.filter(
            (msg): msg is MessageQuote => msg.type === "Quote",
          );

          if (!name || !quote.length) {
            return await reply(help.append);
          }

          const content = await getNote(event.sender.group.id, name);
          content.push(
            await cacheMessage(
              (
                await mirai.messageFromId(quote[0].id)
              ).data.messageChain,
            ),
          );

          await addNote(event.sender.group.id, name, content);

          await reply(`成功追加至「${name}」备忘喵`);
        } // 列举备忘录
        else if (command[1] === "list") {
          const notes = await coll
            .find({
              group: event.sender.group.id,
            })
            .toArray();

          await reply(
            notes.length
              ? `找到以下备忘喵：\n${notes.map((note) => note.name).join("\n")}`
              : "本群还没有备忘喵",
          );
        } // 删除备忘
        else if (command[1] === "delete") {
          const name = command[2].trim();

          if (!name) {
            return await reply(help.delete);
          }

          const success = await coll.deleteOne({
            group: event.sender.group.id,
            name,
          });

          await reply(
            success > 0 ? `成功删除了「${name}」喵` : `「${name}」不存在喵`,
          );
        } // 返回帮助
        else {
          await reply(`备忘帮助喵\n${Object.values(help).join("\n")}`);
        }
      }
    });
};
