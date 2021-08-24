import { DeserializedMessage, IHelperReply, IPlugin } from "../types.ts";
import { getCollection, messageText } from "../utils.ts";

const helpText = `/mc list
/mc start/stop/restart
/mc cancel
/mc ban/pardon <qq>`;
const MCS: {
  url: string,
  group: number,
  start: string,
  stop: string,
  restart: string,
  god: number,
} = JSON.parse(Deno.readTextFileSync('/mcs'));

let stop_timeout = 0;
let restart_timeout = 0;

let start_cooldown = false;
let stop_cooldown = false;
let restart_cooldown = false;

interface BannedPlayer {
  group: number;
  name: number;
}

const banned = getCollection<BannedPlayer>("minecraft");

export const MinecraftPlugin: IPlugin = {
  name: "mc",
  helpText,
  async onGroupMessage(
    helper: IHelperReply,
    gid: number,
    uid: number,
    message: DeserializedMessage,
  ) {
    if (gid !== MCS.group) return;

    const text = messageText(message.messageChain);
    const [command, arg, name] = text.split(" ", 3);

    if (command === "/mc") {

      if (await banned.findOne({ group: gid, name: uid })) {
        helper.reply("您已被封禁");
        return;
      }

      if (arg === "list") {
        try {
          const response = await fetch(MCS.url);
          const data = await response.json();
          
          if (data.status) {
            helper.reply(`${data.motd}\n在线人数：${data.current_players}/${data.max_players}`);
          } else {
            helper.reply('服务器处于关闭状态');
          }
        } catch (e) {
          helper.reply("服务主机已关闭");
        }
        return;
      }

      if (arg === "cancel") {
        if (stop_timeout)    clearTimeout(stop_timeout);
        if (restart_timeout) clearTimeout(restart_timeout);
        if (stop_timeout || restart_timeout) {
          helper.reply("取消成功");
        } else {
          helper.reply("没有待取消的任务");
        }
        stop_timeout = restart_timeout = 0;
        return;
      }

      if (arg === "start") {
        try {
          if (start_cooldown) {
            helper.reply("指令冷却中");
            return;
          }

          start_cooldown = true;
          const response = await fetch(MCS.start);
          const data = await response.json();

          if (data.status === 200) {
            helper.reply("服务器启动成功");
          } else {
            helper.reply(`服务器启动失败：\n${data.error}`);
          }

          setTimeout(() => {
            start_cooldown = false;
          }, 600000);
        } catch (e) {
          helper.reply('服务主机已断开连接');
        }
        return;
      }

      if (arg === "stop") {
        if (stop_cooldown) {
          helper.reply("指令冷却中");
          return;
        }

        stop_cooldown = true;

        stop_timeout = setTimeout(async () => {
          try {
            const response = await fetch(MCS.stop);
            const data = await response.json();
  
            if (data.status === 200) {
              helper.reply("服务器关闭成功");
            } else {
              helper.reply(`服务器关闭失败：\n${data.error}`);
            }
          } catch (e) {
            helper.reply('服务主机已断开连接');
          }
        }, 120000);

        helper.reply("服务器计划于 2min 后关闭，输入 /mc cancel 取消");

        setTimeout(() => {
          stop_cooldown = false;
        }, 600000);
        return;
      }

      if (arg === "restart") {
        if (restart_cooldown) {
          helper.reply("指令冷却中");
          return;
        }

        restart_cooldown = true;

        stop_timeout = setTimeout(async () => {
          try {
            const response = await fetch(MCS.restart);
            const data = await response.json();
  
            if (data.status === 200) {
              helper.reply("服务器重启成功");
            } else {
              helper.reply(`服务器重启失败：\n${data.error}`);
            }
          } catch (e) {
            helper.reply('服务主机已断开连接');
          }
        }, 120000);

        helper.reply("服务器计划于 2min 后重启，输入 /mc cancel 取消");

        setTimeout(() => {
          restart_cooldown = false;
        }, 600000);
        return;
      }

      if (arg === "ban") {
        const uid = Number(name);
        if (uid === 0 || isNaN(uid)) {
          helper.reply('参数错误');
          return;
        }
        if (uid === MCS.god) {
          helper.reply('没想到吧，我特判了');
          return;
        }
        await banned.insertOne({ group: gid, name: uid });
        helper.reply(`成功封禁了用户 ${uid}`);
        return;
      }

      if (arg === "pardon") {
        const uid = Number(name);
        if (uid === 0 || isNaN(uid)) {
          helper.reply('参数错误');
          return;
        }
        await banned.deleteOne({ group: gid, name: uid });
        helper.reply(`成功解封了用户 ${uid}`);
        return;
      }

      helper.reply(helpText);
    }
  },
};
