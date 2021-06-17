import { DeserializedMessage, IHelper, IPlugin } from "../types.ts";
import { messageText, Storage } from "../utils.ts";

const storage = new Storage<string, number>("chouka");

interface YuanshenChizi {
  name: string;
  threeStar: string[];
  fourStar: string[];
  fiveStar: string[];
}

function yuanshenChouka(gid: number, uid: number, chizi: YuanshenChizi) {
  const last_four_star = storage.getOr(`${gid}.${uid}.lastfour`, 0);
  const last_five_star = storage.getOr(`${gid}.${uid}.lastfive`, 0);

  let star = 3;
  if (last_five_star >= 89) star = 5;
  else if (last_four_star >= 9) star = 4;
  else {
    const random = Math.random() * 1000;
    if (random < 6) star = 5;
    else if (random < 57) star = 4;
    else star = 3;
  }

  const now_four_star = star >= 4 ? 0 : last_four_star + 1;
  const now_five_star = star >= 5 ? 0 : last_five_star + 1;

  storage.set(`${gid}.${uid}.lastfour`, now_four_star);
  storage.set(`${gid}.${uid}.lastfive`, now_five_star);

  const chi = star === 3
    ? chizi.threeStar
    : star === 4
    ? chizi.fourStar
    : chizi.fiveStar;
  const result = chi[Math.floor(Math.random() * chi.length)];
  return result;
}

function appendStar(stars: number) {
  return (x: string) => {
    return "⭐".repeat(stars) + " " + x;
  };
}

const YuanshenChangzhu: YuanshenChizi = {
  name: "「奔行世间」常驻祈愿",
  threeStar: "弹弓 神射手之誓 鸦羽弓 翡玉法球 讨龙英杰谭 魔导绪论 黑缨枪 以理服人 沐浴龙血的剑 铁影阔剑 飞天御剑 黎明神剑 冷刃"
    .split(" ").map(appendStar(3)),
  fourStar:
    "烟绯 罗莎莉亚 辛焱 砂糖 迪奥娜 重云 诺艾尔 班尼特 菲谢尔 凝光 行秋 北斗 香菱 安柏 雷泽 凯亚 芭芭拉 丽莎 弓藏 祭礼弓 绝弦 西风猎弓 昭心 祭礼残章 流浪乐章 西风秘典 西风长枪 匣里灭辰 雨裁 祭礼大剑 钟剑 西风大剑 匣里龙吟 祭礼剑 笛剑 西风剑"
      .split(" ")
      .map(appendStar(4)),
  fiveStar: "刻晴 莫娜 七七 迪卢克 琴 阿莫斯之弓 天空之翼 四风原典 天空之卷 和璞鸢 天空之脊 狼的末路 天空之傲 天空之刃 风鹰剑"
    .split(" ").map(appendStar(5)),
};

const YuanshenHuodong1: YuanshenChizi = {
  name: "「闪焰的驻足」活动祈愿",
  threeStar: "弹弓 神射手之誓 鸦羽弓 翡玉法球 讨龙英杰谭 魔导绪论 黑缨枪 以理服人 沐浴龙血的剑 铁影阔剑 飞天御剑 黎明神剑 冷刃"
    .split(" ")
    .map(appendStar(3)),
  fourStar:
    "砂糖 菲谢尔 芭芭拉 烟绯 罗莎莉亚 辛焱 迪奥娜 重云 诺艾尔 班尼特 凝光 行秋 北斗 香菱 雷泽 弓藏 祭礼弓 绝弦 西风猎弓 昭心 祭礼残章 流浪乐章 西风秘典 西风长枪 匣里灭辰 雨裁 祭礼大剑 钟剑 西风大剑 匣里龙吟 祭礼剑 笛剑 西风剑"
      .split(" ")
      .map(appendStar(4)),
  fiveStar: "可莉 刻晴 莫娜 七七 迪卢克 琴"
    .split(" ").map(appendStar(5)),
};

interface ArknightsChizi {
  name: string;
  star3: string[];
  star4: string[];
  star5: string[];
  star6: string[];
  star6_up: string[] | null;
  star5_up: string[] | null;
  star4_up: string[] | null;
}

const ArknightsChangzhu: ArknightsChizi = {
  name: "方舟常驻池(6-24)",
  star6_up: "推进之王/莫斯提马".split("/").map(appendStar(6)),
  star6:
    "能天使/伊芙利特/艾雅法拉/安洁莉娜/闪灵/夜莺/星熊/塞雷娅/银灰/斯卡蒂/陈/黑/赫拉格/麦哲伦/煌/阿/刻俄柏/风笛/傀影/温蒂/早露/铃兰/棘刺/森蚺/史尔特尔/瑕光/泥岩/山/空弦/嗟峨/异客/凯尔希/卡涅利安"
      .split("/").map(appendStar(6)),

  star5_up: "诗怀雅/星极/爱丽丝".split("/").map(appendStar(5)),
  star5:
    "白面鸮/凛冬/德克萨斯/芙兰卡/拉普兰德/幽灵鲨/蓝毒/白金/陨星/天火/梅尔/赫默/华法琳/临光/红/雷蛇/可颂/普罗旺斯/守林人/崖心/初雪/真理/空/狮蝎/食铁兽/夜魔/格劳克斯/送葬人/槐琥/苇草/布洛卡/灰喉/哞/惊垫/慑砂/巫恋/极境/石棉/月禾/莱恩哈特/断崖/蜜蜡/贯维/安哲拉/燧石/四月/奥斯塔/絮雨/卡夫卡/乌有/熔泉水/赤冬/绮良"
      .split("/").map(appendStar(5)),

  star4_up: null,
  star4:
    "夜烟/远山/杰西卡/流星/白雪/清道夫/红豆/杜宾/缠丸/霜叶/慕斯/砾/暗索/末药/调香师/角峰/蛇屠箱/古米/深海色/地灵/阿消/猎蜂/格雷伊/苏苏洛/桃金娘/红云/梅/安比尔/宴/刻刀/波登可/卡达/孑/酸糖/芳汀/泡泡/杰克/松果/豆苗/深靛"
      .split("/").map(appendStar(4)),

  star3: "芬/香草/翎羽/玫兰莎/卡缇/米格鲁/克洛丝/炎熔/芙蓉/安赛尔/史都华德/梓兰/空爆/月见夜/班点/泡普卡".split("/")
    .map(appendStar(3)),
};

function arknightsChouka(gid: number, uid: number, chizi: ArknightsChizi) {
  const last_six_star = storage.getOr(`${gid}.${uid}.lastsix`, 0);
  let six_p = 2;
  if (last_six_star >= 50) six_p += (last_six_star - 49) * 2;
  const random = Math.random() * 100;
  let star = 3;
  if (random < six_p) star = 6;
  else if (random < 10) star = 5;
  else if (random < 60) star = 4;
  else star = 3;

  const now_six_star = star === 6 ? 0 : last_six_star + 1;
  storage.set(`${gid}.${uid}.lastsix`, now_six_star);

  let res: string[] = [];
  if (star === 6) {
    if (Math.random() < 0.5 && chizi.star6_up) res = chizi.star6_up;
    else res = chizi.star6;
  }
  if (star === 5) {
    if (Math.random() < 0.5 && chizi.star5_up) res = chizi.star5_up;
    else res = chizi.star5;
  }
  if (star === 4) {
    if (Math.random() < 0.5 && chizi.star4_up) res = chizi.star4_up;
    else res = chizi.star4;
  }
  if (star === 3) {
    res = chizi.star3;
  }

  return res[Math.floor(Math.random() * res?.length)];
}

const helpText = `直接发送以下内容即可模拟抽卡：{ 原神常驻池, 原神活动池, 方舟常驻池 } + { 单抽, 十连 }`;

export const ChouKaPlugin: IPlugin = {
  name: "chouka",
  helpText,
  onGroupMessage(
    ws: IHelper,
    gid: number,
    uid: number,
    message: DeserializedMessage,
  ) {
    const text = messageText(message.messageChain);
    if (text === "原神常驻池单抽") {
      const result = yuanshenChouka(gid, uid, YuanshenChangzhu);
      ws.sendGroupMessage(gid, `${YuanshenChangzhu.name}\n${result}`);
    }
    if (text === "原神常驻池十连") {
      const result = [];
      for (let i = 0; i < 10; ++i) {
        result.push(yuanshenChouka(gid, uid, YuanshenChangzhu));
      }
      ws.sendGroupMessage(
        gid,
        `${YuanshenChangzhu.name}\n${result.join("\n")}`,
      );
    }
    if (text === "原神活动池单抽") {
      const result = yuanshenChouka(gid, uid, YuanshenHuodong1);
      ws.sendGroupMessage(gid, `${YuanshenHuodong1.name}\n${result}`);
    }
    if (text === "原神活动池十连") {
      const result = [];
      for (let i = 0; i < 10; ++i) {
        result.push(yuanshenChouka(gid, uid, YuanshenHuodong1));
      }
      ws.sendGroupMessage(
        gid,
        `${YuanshenHuodong1.name}\n${result.join("\n")}`,
      );
    }
    if (text === "方舟常驻池单抽") {
      const result = arknightsChouka(gid, uid, ArknightsChangzhu);
      ws.sendGroupMessage(gid, `${ArknightsChangzhu.name}\n${result}`);
    }
    if (text === "方舟常驻池十连") {
      const result = [];
      for (let i = 0; i < 10; ++i) {
        result.push(arknightsChouka(gid, uid, ArknightsChangzhu));
      }
      ws.sendGroupMessage(
        gid,
        `${ArknightsChangzhu.name}\n${result.join("\n")}`,
      );
    }
  },
};
