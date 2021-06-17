import { IHelper, IPlugin } from "../types.ts";
import { messageText, Storage } from "../utils.ts";
import { deserializeFeed, JsonFeed } from "../deps.ts";

const helpText = `自带 RSSHub 镜像
/rss add <url>
/rss delete [id]
/rss update
/rss list`;

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

function getUniqueKey(item: any) {
  return `${item.url}:${item.title}:${item.date_modified}`.replaceAll(
    "\n",
    " ",
  );
}

function getStorageFilename(gid: number) {
  return `data/rss${gid}`;
}

async function readLibrary(gid: number) {
  try {
    return (await Deno.readTextFile(getStorageFilename(gid))).split("\n");
  } catch (e) {
    return [];
  }
}
async function writeLibrary(gid: number, storage: string[]) {
  try {
    await Deno.writeTextFile(getStorageFilename(gid), storage.join("\n"));
  } catch (e) {
    // ignore
  }
}

async function addToLibrary(gid: number, item: any) {
  const storage = await readLibrary(gid);
  const key = getUniqueKey(item);
  if (storage.indexOf(key) > -1) {
    return false;
  }
  await writeLibrary(gid, storage.concat([key]));
  return true;
}

async function addALotToLibrary(gid: number, items: any[]) {
  const storage = await readLibrary(gid);
  for (const item of items) {
    const key = getUniqueKey(item);
    if (storage.indexOf(key) > -1) {
      continue;
    }
    storage.push(key);
  }
  await writeLibrary(gid, storage);
}

interface IRSSSubscribe {
  title: string;
  url: string;
}

const storage = new Storage<number, IRSSSubscribe[]>("rss-subscribe");

async function updateFeeds(helper: IHelper) {
  for (const gid of storage.keys()) {
    const subs = storage.getOr(gid, []);
    for (const sub of subs) {
      try {
        const feed = await fetchFeed(sub.url);
        for (const item of feed.items) {
          const isNew = await addToLibrary(gid, item);
          if (isNew) {
            helper.sendGroupMessage(
              gid,
              `${sub.title} 更新了 ${item.title}\n${item.url}`,
            );
          }
        }
      } catch (e) {
        // ignore it
      }
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
    const [command, subcommand, arg1] = messageText(message.messageChain).split(
      " ",
      3,
    );
    if (command === "/rss") {
      if (subcommand === "add") {
        if (!arg1) {
          helper.reply("参数错误");
          return;
        }

        try {
          new URL(arg1);
        } catch (e) {
          helper.reply("？");
          return;
        }
        const suburl = arg1.replace(
          /^https?:\/\/rsshub\.app\//,
          "http://localhost:1200/",
        );

        try {
          const feed = await fetchFeed(suburl);
          await addALotToLibrary(gid, feed.items);
          const subs = storage.getOr(gid, []);
          subs.push({
            title: feed.title,
            url: suburl,
          });
          storage.set(gid, subs);
          helper.reply(`成功订阅了 ${feed.title}`);
        } catch (e) {
          helper.reply("订阅失败");
        }
        return;
      }

      if (subcommand === "delete") {
        const number = Number(arg1);
        if (isNaN(number)) {
          helper.reply("？？");
          return;
        }
        const subs = storage.getOr(gid, []);
        if (number < 0 || number >= subs.length || !subs[number]) {
          helper.reply("java.lang.ArrayIndexOutOfBoundsException");
          return;
        }
        const removed = subs[number];
        storage.set(gid, subs.slice(0, number).concat(subs.slice(number + 1)));
        helper.reply(`成功取消订阅了 ${removed.title}`);
        return;
      }

      if (subcommand === "list") {
        const subs = storage.getOr(gid, []);
        helper.reply(
          `RSS 订阅列表：\n${
            subs.map((sub, index) => `[${index}] ${sub.title}`).join("\n")
          }`,
        );
        return;
      }

      if (subcommand === "update") {
        await updateFeeds(helper);
        helper.reply("更新完毕");
        return;
      }

      helper.reply("/help rss");
    }
  },
};
