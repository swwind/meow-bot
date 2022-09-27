import { db } from "../db.ts";
import { MessageChain, Mirai, parseFeed, Webhook } from "../deps.ts";
import { extractText } from "../utils.ts";

type RSSRecord = {
  group: number;
  title: string;
  url: string;
};

type RSSSource = {
  group: number;
  title: string;
  url: string;
};

const collRecord = db.collection<RSSRecord>("rss/record");
const collSource = db.collection<RSSSource>("rss/source");

await collSource.createIndexes({
  indexes: [
    {
      key: {
        group: 1,
        url: 1,
      },
      name: "key",
      unique: true,
    },
  ],
});

async function addSource(group: number, title: string, url: string) {
  await collSource.updateOne(
    { group, url },
    { $set: { title } },
    { upsert: true }
  );

  return { group, title, url };
}

function listSource(group: number) {
  return collSource.find({ group }).toArray();
}

function removeSource(group: number, url: string) {
  return collSource.deleteOne({ group, url });
}

async function updateSource(source: RSSSource) {
  const response = await fetch(source.url);
  const xml = await response.text();
  const feed = await parseFeed(xml);

  return (
    await Promise.all(
      feed.entries.map(async (item) => {
        const record: RSSRecord = {
          group: source.group,
          title: item.title?.value ?? "[no title]",
          url: item.links.map((link) => link.href).join("\n"),
        };

        if (await collRecord.findOne(record)) {
          return null;
        }

        await collRecord.insertOne(record);

        return record;
      })
    )
  ).filter((record): record is RSSRecord => record !== null);
}

const help = {
  add: "/rss add <url>",
  list: "/rss list",
  delete: "/rss delete [index]",
  update: "/rss update",
};

export default (webhook: Webhook, mirai: Mirai) => {
  function pushUpdate(source: RSSSource, record: RSSRecord) {
    return mirai.sendGroupMessage({
      target: source.group,
      messageChain: [
        {
          type: "Plain",
          text: `${source.title} 更新了 ${record.title}\n${record.url}`,
        },
      ],
    });
  }

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
          messageChain:
            typeof message === "string"
              ? [{ type: "Plain", text: message }]
              : message,
        });

      if (command[0] === "/rss") {
        if (command[1] === "add") {
          let url = command[2];

          if (!url || !/^https?:\/\//.test(url)) {
            return await reply(help.add);
          }

          try {
            url = url.replace("https://rsshub.app", "http://localhost:1200");
            new URL(url);
            const response = await fetch(url);
            const xml = await response.text();
            const feed = await parseFeed(xml);
            const title = feed.title.value || "[no title]";

            const source = await addSource(event.sender.group.id, title, url);
            await updateSource(source);

            return await reply(`成功添加了「${title}」喵`);
          } catch (_) {
            return await reply("获取 RSS 源失败了喵");
          }
        } else if (command[1] === "list") {
          const sources = await listSource(event.sender.group.id);
          await reply(
            sources.length
              ? `本群的所有订阅喵：\n${sources
                  .map((source, index) => `[${index}] ${source.title}`)
                  .join("\n")}`
              : "本群还没有订阅喵"
          );
        } else if (command[1] === "delete") {
          const index = parseInt(command[2]);
          const sources = await listSource(event.sender.group.id);
          if (isNaN(index) || index < 0 || index >= sources.length) {
            return await reply(help.delete);
          }
          await removeSource(event.sender.group.id, sources[index].url);
          await reply("删除成功喵");
        } else if (command[1] === "update") {
          const sources = await listSource(event.sender.group.id);

          const result = await Promise.allSettled(sources.map(updateSource));

          await Promise.allSettled(
            result.map(async (r, i) => {
              if (r.status === "fulfilled") {
                await Promise.allSettled(
                  r.value.map((record) => pushUpdate(sources[i], record))
                );
              }
            })
          );

          const newcount = result
            .map((r) => (r.status === "fulfilled" ? r.value.length : 0))
            .reduce((a, b) => a + b, 0);

          const failcount = result
            .map((r) => (r.status === "rejected" ? 1 : 0))
            .reduce((a, b) => a + b, 0 as number);

          await reply(
            [
              "更新成功喵",
              newcount ? `共 ${newcount} 条新消息` : "没有新消息喵",
              failcount ? `有 ${failcount} 个订阅源更新失败` : "",
            ]
              .join("\n")
              .trim()
          );
        } else {
          await reply(`RSS 订阅帮助喵\n${Object.values(help).join("\n")}`);
        }
      }
    });

  setInterval(async () => {
    const sources = await collSource.find({}).toArray();

    for (const source of sources) {
      try {
        const update = await updateSource(source);
        await Promise.all(update.map((record) => pushUpdate(source, record)));
      } catch (_) {
        // ignore
      }
    }
  }, 1000 * 60 * 10);
};
