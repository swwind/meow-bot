import { Mirai, Webhook } from "./deps.ts";

import pong from "./plugin/pong.ts";
import note from "./plugin/note.ts";
import rss from "./plugin/rss.ts";
import ban from "./plugin/ban.ts";
import flash from "./plugin/flash.ts";
import bilibili from "./plugin/bilibili.ts";

const webhook = new Webhook(8000);
const mirai = new Mirai("http://localhost:8080");

pong(webhook, mirai);
note(webhook, mirai);
rss(webhook, mirai);
ban(webhook, mirai);
flash(webhook, mirai);
bilibili(webhook, mirai);
