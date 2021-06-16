import { IHelper, IPlugin, DeserializedMessage, IMessageChain } from "../types.ts";

const filename = 'data/notes';
let map: Map<string, IMessageChain>;
const helpText = `/note set xxx (quote)
/note append xxx (quote)
/note delete xxx
/note help
/note list`;

function read() {
  try {
    const data = Deno.readTextFileSync(filename);
    map = new Map(JSON.parse(data));
  } catch (e) {
    map = new Map();
  }
}

function write() {
  if (map) {
    Deno.writeTextFile(filename, JSON.stringify(Array.from(map)));
  }
}

export const NotePlugin: IPlugin = {
  initialize(ws: IHelper) {
    read();
  },
  onGroupMessage(ws: IHelper, gid: number, uid: number, message: DeserializedMessage) {
    const list = message.text.split(' ').filter(a => !!a);
    if (list[0] === '/note') {
      if (list.length < 2 || list[1] === 'help') {
        ws.sendGroupMessage(gid, helpText);
        return;
      }
      if (list[1] === 'set') {
        if (!list[2]) {
          ws.sendGroupMessage(gid, '参数错误');
          return;
        }
        if (!message.quote) {
          ws.sendGroupMessage(gid, '请回复需要写入的内容');
          return;
        }
        map.set(`${gid}.${list[2]}`, message.quote);
        ws.sendGroupMessage(gid, '添加成功');
        write();
        return;
      }
      if (list[1] === 'append') {
        if (!list[2]) {
          ws.sendGroupMessage(gid, '参数错误');
          return;
        }
        if (!message.quote) {
          ws.sendGroupMessage(gid, '请回复需要写入的内容');
          return;
        }
        const last = map.get(`${gid}.${list[2]}`) ?? [];
        map.set(`${gid}.${list[2]}`, last.concat(message.quote));
        ws.sendGroupMessage(gid, '更新成功');
        write();
        return;
      }
      if (list[1] === 'get') {
        if (!list[2]) {
          ws.sendGroupMessage(gid, '参数错误');
          return;
        }
        const note = map.get(`${gid}.${list[2]}`);
        if (typeof note === 'string') {
          ws.sendGroupMessage(gid, note);
        } else {
          ws.sendGroupMessage(gid, `找不到 ${list[2]}`)
        }
        return;
      }
      if (list[1] === 'delete') {
        if (!list[2]) {
          ws.sendGroupMessage(gid, '参数错误');
          return;
        }
        const success = map.delete(`${gid}.${list[2]}`);
        ws.sendGroupMessage(gid, success ? '删除成功' : '删除失败');
        write();
        return;
      }
      if (list[1] === 'list') {
        const header = `${gid}.`;
        const data = Array.from(map.keys()).map((key) => {
          return key.startsWith(header) ? key.slice(header.length) : '';
        }).filter(a => !!a);
        const message = data.length ? data.join('\n') : '没有 note';
        ws.sendGroupMessage(gid, message);
        return;
      }
      ws.sendGroupMessage(gid, helpText);
      return;
    }

    const note = map.get(`${gid}.${message.text}`);
    if (note) {
      ws.sendGroupMessage(gid, note);
      return;
    }
  },
  onFriendMessage(ws: IHelper, uid: number, message: DeserializedMessage) {
  },
};
