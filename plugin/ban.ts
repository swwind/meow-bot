import { db } from "../db.ts";
import { MessageChain, Mirai, Webhook } from "../deps.ts";
import {
  cacheMessage,
  extractQuote,
  extractSource,
  extractText,
} from "../utils.ts";

type Ban = {
  group: number;
  regex: string;
  reason: MessageChain | null;
};

const coll = db.collection<Ban>("bans");

await coll.createIndexes({
  indexes: [
    {
      key: {
        group: 1,
        regex: 1,
      },
      name: "key",
      unique: true,
    },
  ],
});

async function addBan(
  group: number,
  regex: string,
  reason: MessageChain | null
) {
  await coll.updateOne(
    { group, regex },
    { $set: { reason } },
    { upsert: true }
  );
}

const help = {
  ban: "/ban <regex> (请使用回复方式指定理由)",
  pardon: "/pardon <regex>",
  blacklist: "/blacklist",
};

export default (webhook: Webhook, mirai: Mirai) => {
  const groupMessages = webhook.pipe((event) =>
    event.type === "GroupMessage" || event.type === "GroupSyncMessage"
      ? [event]
      : null
  );

  // trigger ban
  groupMessages.attach(async (event) => {
    const message = extractText(event.messageChain);

    const blacklist = await coll
      .find({
        group: event.sender.group.id,
      })
      .toArray();

    const triggered = blacklist.find(({ regex }) => {
      const regexp = new RegExp(regex, "i");
      return regexp.test(message);
    });

    if (
      triggered &&
      event.sender.permission === "MEMBER" &&
      (event.sender.group.permission === "ADMINISTRATOR" ||
        event.sender.group.permission === "OWNER")
    ) {
      await mirai.recall({
        target: extractSource(event.messageChain)!.id,
      });

      await mirai.mute({
        target: event.sender.group.id,
        memberId: event.sender.id,
        time: 60,
      });

      await mirai.sendGroupMessage({
        target: event.sender.group.id,
        messageChain: [
          {
            type: "Plain",
            text: `用户 ${
              event.sender.memberName || event.sender.id
            } 已被禁言喵`,
          },
        ],
      });

      if (triggered.reason) {
        await mirai.sendGroupMessage({
          target: event.sender.group.id,
          messageChain: triggered.reason,
        });
      }
    }
  });

  groupMessages.attach(async (event) => {
    const message = extractText(event.messageChain);
    const command = message.split(" ");
    const quote = extractQuote(event.messageChain);
    const isAdmin =
      event.sender.permission === "ADMINISTRATOR" ||
      event.sender.permission === "OWNER";

    if (!isAdmin) {
      return;
    }

    if (command[0] === "/ban") {
      const regex = command.slice(1).join(" ").trim();
      const reason = quote
        ? await cacheMessage(
            (
              await mirai.messageFromId(quote.id)
            ).data.messageChain
          )
        : null;

      if (!regex) {
        return await mirai.sendGroupMessage({
          target: event.sender.group.id,
          messageChain: [
            {
              type: "Plain",
              text: Object.values(help).join("\n"),
            },
          ],
        });
      }

      await addBan(event.sender.group.id, regex, reason);
      await mirai.sendGroupMessage({
        target: event.sender.group.id,
        messageChain: [
          {
            type: "Plain",
            text: `成功加入正则表达式 /${regex}/i 到黑名单喵`,
          },
        ],
      });
    } else if (command[0] == "/pardon") {
      const regex = command.slice(1).join(" ").trim();
      const result = await coll.deleteOne({
        group: event.sender.group.id,
        regex,
      });

      if (!regex) {
        return await mirai.sendGroupMessage({
          target: event.sender.group.id,
          messageChain: [
            {
              type: "Plain",
              text: Object.values(help).join("\n"),
            },
          ],
        });
      }

      await mirai.sendGroupMessage({
        target: event.sender.group.id,
        messageChain: [
          {
            type: "Plain",
            text:
              result > 0
                ? `成功将正则表达式 /${regex}/i 从黑名单中移除喵`
                : "没有找到此正则表达式喵",
          },
        ],
      });
    } else if (command[0] == "/blacklist") {
      const blacklist = await coll
        .find({
          group: event.sender.group.id,
        })
        .toArray();

      await mirai.sendGroupMessage({
        target: event.sender.group.id,
        messageChain: [
          {
            type: "Plain",
            text: blacklist.length
              ? `共有 ${blacklist.length} 个黑名单喵\n${blacklist
                  .map(({ regex }) => `/${regex}/i`)
                  .join("\n")}`
              : "没有黑名单喵",
          },
        ],
      });
    }
  });
};
