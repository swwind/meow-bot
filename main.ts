import { IHelper, IPlugin } from "./types.ts";

const botid = 2531895613;

const decoder = new TextDecoder("utf-8");
const data = await Deno.readFile("key");
const verifyKey = decoder.decode(data);

const url = `ws://localhost:21414/all?verifyKey=${verifyKey}&qq=${botid}`;

import { RSSPlugin } from "./modules/rss.ts";
import { PongPlugin } from './modules/pong.ts';
import { NotePlugin } from './modules/note.ts';

const pluginList: IPlugin[] = [
  RSSPlugin,
  PongPlugin,
  NotePlugin,
];

function escapeMessage(arr: any[]) {
  return arr.map((a) => {
    if (a.type === "Plain") return a.text;
    if (a.type === "At") return "@" + (a.display || a.target) + " ";
    return "";
  }).join("");
}

const ws = new WebSocket(url);
ws.onopen = () => {
  console.log("online!");
};

ws.onclose = () => {
  console.log("offline!");
};

function sendMessage(command: String, subCommand: String | null, content: any) {
  ws.send(JSON.stringify({
    syncId: -1,
    command,
    subCommand,
    content,
  }));
}

function sendGroupMessage(group: number, text: string) {
  sendMessage("sendGroupMessage", null, {
    target: group,
    messageChain: [
      { type: "Plain", text },
    ],
  });
}
function sendFriendMessage(uid: number, text: string) {
  sendMessage("sendFriendMessage", null, {
    target: uid,
    messageChain: [
      { type: "Plain", text },
    ],
  });
}

const helper: IHelper = {
  sendGroupMessage,
  sendFriendMessage,
};

function emitGroupMessage(gid: number, uid: number, message: string) {
  pluginList.forEach((plugin) => {
    plugin.onGroupMessage(helper, gid, uid, message);
  });
}

function emitFriendMessage(uid: number, message: string) {
  pluginList.forEach((plugin) => {
    plugin.onFriendMessage(helper, uid, message);
  });
}

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);
  if (data.data.type === "GroupMessage") {
    emitGroupMessage(
      data.data.sender.group.id,
      data.data.sender.id,
      escapeMessage(data.data.messageChain),
    );
  }
  if (data.data.type === "FriendMessage") {
    emitFriendMessage(
      data.data.sender.id,
      escapeMessage(data.data.messageChain),
    );
  }
};

pluginList.forEach((plugin) => {
  plugin.initialize(helper);
});
