import { DeserializedMessage, IHelperReply, IPlugin } from "../types.ts";
import { messageText } from "../utils.ts";

function fetchTimeout(url: string | URL, timeout = 5000) {
  return Promise.race([
    new Promise<Response>((_, reject) => setTimeout(reject, timeout)),
    fetch(url),
  ]);
}

async function fetchLovemikuSetu() {
  const data = await (await fetchTimeout('https://api.lovemiku.online/miku/?master=1')).json();
  const url = data?.url;
  if (typeof url !== 'string') {
    throw new Error('Not found');
  }
  return url;
}

async function fetchLoliconSetu() {
  const dst = new URL('https://api.lolicon.app/setu/v2');
  const data = await (await fetchTimeout(dst)).json();
  const url = data?.data?.[0]?.urls?.original;
  if (typeof url !== 'string') {
    throw new Error('Not found');
  }
  return url;
}

async function fetchLoliconTagSetu(tag: string) {
  const dst = new URL('https://api.lolicon.app/setu/v2');
  dst.searchParams.append('tag', tag);
  const data = await (await fetchTimeout(dst)).json();
  const url = data?.data?.[0]?.urls?.original;
  if (typeof url !== 'string') {
    throw new Error('Not found');
  }
  return url;
}

async function fetchLocalSetu() {
  const setus: string[] = [];
  for await (const entry of Deno.readDir("/root/setu")) {
    if (entry.isFile && /\.(?:jpe?g|png)$/i.test(entry.name)) {
      setus.push(entry.name);
    }
  }
  if (!setus.length) {
    throw new Error();
  }
  const setu = setus[Math.floor(Math.random() * setus.length)];
  return `file:///root/setu/${setu}`;
}

async function fetchIslandwind233Setu() {
  return 'https://islandwind233.pro/ZY/API/getimgapi.php';
}

async function fetchToubiecSetu() {
  const data = await (await fetchTimeout('https://acg.toubiec.cn/random.php?ret=json')).json();
  const url = data?.[0]?.imgurl;
  if (typeof url !== 'string') {
    throw new Error('Not found');
  }
  return url;
}

async function fetchTouhouSetu() {
  return 'https://img.paulzzh.tech/touhou/random';
}

const setuApis = [{
  name: 'local',
  fetch: fetchLocalSetu,
}, {
  name: 'lovemiku',
  fetch: fetchLovemikuSetu,
}, {
  name: 'lolicon',
  fetch: fetchLoliconSetu,
}, {
  name: 'islandwind233',
  fetch: fetchIslandwind233Setu,
}, {
  name: 'toubiec',
  fetch: fetchToubiecSetu,
}, {
  name: 'touhou',
  fetch: fetchTouhouSetu,
}];

const helpText = `来点 $type? 涩图\ntype = { ${setuApis.map(({ name }) => name).join(', ')} } | <TAG>`;

export const SetuPlugin: IPlugin = {
  name: "setu",
  helpText,
  async onAllMessage(
    helper: IHelperReply,
    gid: number,
    _uid: number,
    message: DeserializedMessage,
  ) {
    const text = messageText(message.messageChain);
    const result = /^来点([\s\S]*)(?:涩|色)图$/gi.exec(text);
    if (result) {
      const type = result[1].trim();
      try {
        if (type === '') {
          const api = setuApis[Math.floor(Math.random() * setuApis.length)];
          helper.reply([{
            type: 'Image',
            url: await api.fetch(),
          }]);
          return;
        }
        for (const api of setuApis) {
          if (api.name === type) {
            helper.reply([{
              type: 'Image',
              url: await api.fetch(),
            }]);
            return;
          }
        }
        // type is a tag
        if (!gid) {
          // is friend chat
          try {
            helper.reply([{
              type: 'Image',
              url: await fetchLoliconTagSetu(type),
            }]);
          } catch (e) {
            helper.reply(`找不到带有标签「${type}」的涩图`);
          }
        } else {
          // is group chat
          helper.reply('按 tag 搜索无法在群组中使用');
        }
      } catch (e) {
        helper.reply(Math.random() < 0.01 ? '别冲了' : '获取失败，可能图源炸了');
      }
    }
  },
};
