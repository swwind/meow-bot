import { IHelper, IPlugin } from "../types.ts";
import { getCollection, messageText } from "../utils.ts";
import { deserializeFeed, JsonFeed } from "../deps.ts";

const helpText = `自带 RSSHub 镜像
/rss add <url>
/rss delete [id]
/rss update
/rss list`;

interface CntSchema {
  gid: number;
  count: number;
}

interface RSSSchema {
  gid: number;
  name: string;
  url: string;
  id: number;
}

interface SubSchema {
  gid: number;
  title: string;
  url: string;
  date_modified: Date;
}

const collectionRSS = getCollection<RSSSchema>("rss");
const collectionSub = getCollection<SubSchema>("rss-sub");
const collectionCnt = getCollection<CntSchema>("rss-cnt");

function fetchFeed(url: string, timeout = 10000) {
  return Promise.race([
    new Promise<JsonFeed>((_, reject) => setTimeout(reject, timeout)),
    (async () => {
      const response = await fetch(url);
      const xml = await response.text();
      const { feed } = await deserializeFeed(xml, { outputJsonFeed: true });
      return feed;
    })(),
  ]);
}

async function addToLibrary(sub: SubSchema) {
  const findRes = await collectionSub.findOne(sub);
  if (findRes) {
    return false;
  }
  await collectionSub.insertOne(sub);
  return true;
}

async function updateFeeds(helper: IHelper, gidOnly?: number | undefined) {
  const rss = await collectionRSS.find(
    typeof gidOnly === "number" ? { gid: gidOnly } : {},
  ).toArray();

  for (const sub of rss) {
    const gid = sub.gid;
    try {
      const feed = await fetchFeed(sub.url);

      for (const item of feed.items) {
        const url = item.url ?? "[nolink]";
        const title = item.title ?? "[untitled]";
        const date_modified = item.date_modified ?? new Date(0);

        const isNew = await addToLibrary({ gid, url, title, date_modified });

        if (isNew) {
          helper.sendGroupMessage(
            gid,
            `${sub.name} 更新了 ${item.title}\n${item.url}`,
          );
        }
      }
    } catch (e) {
      // ignore it
    }
  }
}

export const RSSPlugin: IPlugin = {
  name: "rss",
  helpText,
  initialize(helper) {
    setInterval(() => {
      updateFeeds(helper);
    }, 10 * 60 * 1000);
  },
  async onGroupMessage(helper, gid, _uid, message) {
    const [command, subcommand, arg] = messageText(message.messageChain).split(
      " ",
      3,
    );

    if (command === "/rss") {
      if (subcommand === "add") {
        if (!arg) {
          helper.reply("参数错误");
          return;
        }

        try {
          new URL(arg);
        } catch (e) {
          helper.reply("无法解析 URL");
          return;
        }

        const url = arg.replace(
          /^https?:\/\/rsshub\.app\//,
          "http://localhost:1200/",
        );

        const findRes = await collectionRSS.findOne({ gid, url });
        if (findRes) {
          helper.reply("不能重复订阅");
          return;
        }

        try {
          const feed = await fetchFeed(url);
          for (const item of feed.items) {
            const url = item.url ?? "[nolink]";
            const title = item.title ?? "[untitled]";
            const date_modified = item.date_modified ?? new Date(0);
            await addToLibrary({ gid, url, title, date_modified });
          }
          const name = feed.title;

          await collectionCnt.updateOne({ gid }, { $inc: { count: 1 } }, {
            upsert: true,
          });
          const findRes = await collectionCnt.findOne({ gid });
          if (!findRes) {
            helper.reply("数据库炸了，问题很大");
            return;
          }
          const count = findRes.count;
          await collectionRSS.insertOne({ gid, name, url, id: count });
          helper.reply(`成功订阅了 [${count}] ${name}`);
        } catch (e) {
          helper.reply("获取内容失败");
        }
        return;
      }

      if (subcommand === "delete") {
        const id = Number(arg);
        if (isNaN(id)) {
          helper.reply("无法识别");
          return;
        }
        const findRes = await collectionRSS.findOne({ gid, id });
        if (!findRes) {
          helper.reply(`找不到序号为 [${id}] 的订阅`);
          return;
        }
        const deleteRes = await collectionRSS.deleteOne({ gid, id });
        helper.reply(
          deleteRes > 0 ? `成功取消订阅了 [${id}] ${findRes.name}` : "删除订阅失败",
        );
        return;
      }

      if (subcommand === "list") {
        const rss = await collectionRSS.find({ gid }).toArray();
        helper.reply(
          rss.length
            ? `RSS 订阅列表：\n${
              rss.map((sub) => `[${sub.id}] ${sub.name}`).join("\n")
            }`
            : "还没有订阅",
        );
        return;
      }

      if (subcommand === "update") {
        await updateFeeds(helper, gid);
        helper.reply("更新完毕");
        return;
      }

      helper.reply("/help rss");
    }
  },
};
