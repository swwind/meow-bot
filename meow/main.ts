import { createHttp, createWebhook, Mirai } from "../mod.ts";

import pong from "./plugin/pong.ts";
import note from "./plugin/note.ts";
import rss from "./plugin/rss.ts";
import ban from "./plugin/ban.ts";

const webhook = createWebhook(8000);
const http = createHttp("http://localhost:8080");

const bot = new Mirai(webhook, http);

bot.addPlugin(pong);
bot.addPlugin(note);
bot.addPlugin(rss);
bot.addPlugin(ban);

// webhook.attach((event) => {
//   console.log(event);
// });
