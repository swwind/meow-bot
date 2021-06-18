import {
  DeserializedMessage,
  IHelperReply,
  IMessageChain,
  IPlugin,
} from "./types.ts";

import { messageText } from "./utils.ts";

const botid = 2531895613;

const decoder = new TextDecoder("utf-8");
const data = await Deno.readFile("/flag");
const verifyKey = decoder.decode(data);

const url = `ws://localhost:21414/all?verifyKey=${verifyKey}&qq=${botid}`;

import { RSSPlugin } from "./plugins/rss.ts";
import { PongPlugin } from "./plugins/pong.ts";
import { NotePlugin } from "./plugins/note.ts";
import { ChoukaPlugin } from "./plugins/chouka.ts";
import { HashPlugin } from "./plugins/hash.ts";
import { SetuPlugin } from "./plugins/setu.ts";

const pluginList: IPlugin[] = [
  RSSPlugin,
  PongPlugin,
  NotePlugin,
  ChoukaPlugin,
  HashPlugin,
  SetuPlugin,
];

const ws = new WebSocket(url);
ws.onopen = () => {
  console.log("online!");
};

ws.onclose = () => {
  console.log("offline!");
};

let globalSyncId = 114514;
let callbacks = new Map<String, Function>();
function makeRequest(
  command: String,
  subCommand: String | null,
  content: any,
  callback: (code: number, data: any) => void,
) {
  const syncId = String(++globalSyncId);
  ws.send(JSON.stringify({
    syncId,
    command,
    subCommand,
    content,
  }));
  callbacks.set(syncId, callback);
  setTimeout(() => {
    if (callbacks.has(syncId)) {
      callback(5, undefined);
      callbacks.delete(syncId);
    }
  }, 2000);
}
function requestMessageChain(messageId: number) {
  return new Promise<IMessageChain>((resolve, reject) => {
    makeRequest("messageFromId", null, {
      id: messageId,
    }, (code, data) => {
      if (code) reject();
      else resolve(data.messageChain);
    });
  });
}

async function deserializeMessageChain(
  messageChain: IMessageChain,
): Promise<DeserializedMessage> {
  let quote: IMessageChain | null = null;
  for (const message of messageChain) {
    if (message.type === "Quote") {
      try {
        quote = await requestMessageChain(message.id);
      } catch (e) {
        quote = message.origin;
      }
    }
  }
  return {
    messageChain,
    quote,
  };
}

function sendCommand(command: String, subCommand: String | null, content: any) {
  ws.send(JSON.stringify({
    syncId: "-1",
    command,
    subCommand,
    content,
  }));
}
function sendGroupMessage(group: number, text: string | IMessageChain) {
  sendCommand("sendGroupMessage", null, {
    target: group,
    messageChain: Array.isArray(text)
      ? text.filter(({ type }) => type != "Source")
      : [
        { type: "Plain", text },
      ],
  });
}
function sendFriendMessage(uid: number, text: string | IMessageChain) {
  sendCommand("sendFriendMessage", null, {
    target: uid,
    messageChain: Array.isArray(text)
      ? text.filter(({ type }) => type != "Source")
      : [
        { type: "Plain", text },
      ],
  });
}

function emitGroupMessage(
  gid: number,
  uid: number,
  message: DeserializedMessage,
) {
  pluginList.forEach((plugin) => {
    const helper: IHelperReply = {
      sendFriendMessage,
      sendGroupMessage,
      reply(text) {
        sendGroupMessage(gid, text);
      },
    };
    plugin.onGroupMessage && plugin.onGroupMessage(helper, gid, uid, message);
    plugin.onAllMessage && plugin.onAllMessage(helper, gid, uid, message);
  });
}

function emitFriendMessage(uid: number, message: DeserializedMessage) {
  pluginList.forEach((plugin) => {
    const helper: IHelperReply = {
      sendFriendMessage,
      sendGroupMessage,
      reply(text) {
        console.log(text);
        sendFriendMessage(uid, text);
      },
    };
    plugin.onFriendMessage && plugin.onFriendMessage(helper, uid, message);
    plugin.onAllMessage && plugin.onAllMessage(helper, 0, uid, message);
  });
}

ws.onmessage = async (e) => {
  const data = JSON.parse(e.data);
  if (data.syncId && callbacks.has(data.syncId)) {
    const callback = callbacks.get(data.syncId);
    if (callback) {
      callback(data.data.code, data.data.data);
      callbacks.delete(data.syncId);
    }
    return;
  }

  if (data.data?.messageChain) {
    const [command, args] = messageText(data.data.messageChain).split(" ", 2);
    if (command === "/help") {
      let replyMessage = "";

      if (args) {
        replyMessage = `没有找到 ${args} 插件`;
        for (const plugin of pluginList) {
          if (plugin.name === args) {
            replyMessage = plugin.helpText;
            break;
          }
        }
      } else {
        replyMessage = `/help [plugin]\n已经安装的插件：\n${
          pluginList.map(({ name }) => name).join("\n")
        }`;
      }

      if (data.data.type === "GroupMessage") {
        sendGroupMessage(data.data.sender.group.id, replyMessage);
      } else if (data.data.type === "FriendMessage") {
        sendFriendMessage(data.data.sender.id, replyMessage);
      }

      return;
    }
  }

  if (data.data?.type === "GroupMessage") {
    emitGroupMessage(
      data.data.sender.group.id,
      data.data.sender.id,
      await deserializeMessageChain(data.data.messageChain),
    );
  }
  if (data.data?.type === "FriendMessage") {
    emitFriendMessage(
      data.data.sender.id,
      await deserializeMessageChain(data.data.messageChain),
    );
  }
};

pluginList.forEach((plugin) => {
  plugin.initialize && plugin.initialize({
    sendFriendMessage,
    sendGroupMessage,
  });
});
