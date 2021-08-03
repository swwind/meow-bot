import { DeserializedMessage, IHelperReply, IPlugin } from "../types.ts";
import { getCollection, messageText } from "../utils.ts";

interface ChoukaSchema {
  gid: number;
  uid: number;
  yuanshen_last_four: number;
  yuanshen_last_five: number;
  arknights_last_six: number;
  yuanshen_targeted_four: number;
  yuanshen_targeted_five: number;
}

const collection = getCollection<ChoukaSchema>("chouka");

function appendStar(stars: number) {
  return (x: string) => {
    return "⭐".repeat(stars) + " " + x;
  };
}

interface YuanshenChizi {
  star3: string[];
  star5: string[];
  star5_up: string[];
  star5_up_p: number;
  star5_up_baodi: number;
  star4: string[];
  star4_up: string[];
  star4_up_p: number;
  star4_up_baodi: number;
}

const YuanshenChangzhu: YuanshenChizi = {
  star3: "弹弓 神射手之誓 鸦羽弓 翡玉法球 讨龙英杰谭 魔导绪论 黑缨枪 以理服人 沐浴龙血的剑 铁影阔剑 飞天御剑 黎明神剑 冷刃"
    .split(" ").map(appendStar(3)),
  star4:
    "烟绯 罗莎莉亚 辛焱 砂糖 迪奥娜 重云 诺艾尔 班尼特 菲谢尔 凝光 行秋 北斗 香菱 安柏 雷泽 凯亚 芭芭拉 丽莎 弓藏 祭礼弓 绝弦 西风猎弓 昭心 祭礼残章 流浪乐章 西风秘典 西风长枪 匣里灭辰 雨裁 祭礼大剑 钟剑 西风大剑 匣里龙吟 祭礼剑 笛剑 西风剑"
      .split(" ")
      .map(appendStar(4)),
  star4_up: [],
  star4_up_p: 0,
  star4_up_baodi: 0,
  star5: "刻晴 莫娜 七七 迪卢克 琴 阿莫斯之弓 天空之翼 四风原典 天空之卷 和璞鸢 天空之脊 狼的末路 天空之傲 天空之刃 风鹰剑"
    .split(" ").map(appendStar(5)),
  star5_up: [],
  star5_up_p: 0,
  star5_up_baodi: 0,
};

const YuanshenHuodong1: YuanshenChizi = {
  star3: "弹弓 神射手之誓 鸦羽弓 翡玉法球 讨龙英杰谭 魔导绪论 黑缨枪 以理服人 沐浴龙血的剑 铁影阔剑 飞天御剑 黎明神剑 冷刃"
    .split(" ")
    .map(appendStar(3)),
  star4:
    "烟绯 辛焱 迪奥娜 重云 诺艾尔 凝光 行秋 北斗 香菱 弓藏 祭礼弓 绝弦 西风猎弓 昭心 祭礼残章 流浪乐章 西风秘典 西风长枪 匣里灭辰 雨裁 祭礼大剑 钟剑 西风大剑 匣里龙吟 祭礼剑 笛剑 西风剑 砂糖 菲谢尔 芭芭拉"
      .split(" ")
      .map(appendStar(4)),
  star4_up: "罗莎莉亚 班尼特 雷泽".split(" ").map(appendStar(4)),
  star4_up_p: .5,
  star4_up_baodi: 1,
  star5: "刻晴 莫娜 七七 迪卢克 琴"
    .split(" ").map(appendStar(5)),
  star5_up: "枫原万叶".split(" ").map(appendStar(5)),
  star5_up_p: .5,
  star5_up_baodi: 1,
};

const YuanshenHuodong2: YuanshenChizi = {
  star3: "弹弓 神射手之誓 鸦羽弓 翡玉法球 讨龙英杰谭 魔导绪论 黑缨枪 以理服人 沐浴龙血的剑 铁影阔剑 飞天御剑 黎明神剑 冷刃"
    .split(" ")
    .map(appendStar(3)),
  star4:
    "烟绯 罗莎莉亚 辛焱 砂糖 迪奥娜 重云 诺艾尔 班尼特 菲谢尔 凝光 行秋 北斗 香菱 雷泽 芭芭拉 弓藏 祭礼弓 绝弦 西风猎弓 昭心 祭礼残章 西风秘典 雨裁 祭礼大剑 祭礼剑 笛剑 西风剑 流浪乐章 西风长枪 钟剑 匣里龙吟"
      .split(" ")
      .map(appendStar(4)),
  star4_up: "暗巷猎手 暗巷的酒与诗 匣里灭辰 西风大剑 暗巷闪光".split(" ").map(appendStar(4)),
  star4_up_p: .5,
  star4_up_baodi: 1,
  star5: "阿莫斯之弓 天空之翼 四风原典 和璞鸢 天空之脊 狼的末路 天空之傲 天空之刃 风鹰剑"
    .split(" ").map(appendStar(5)),
  star5_up: "天空之卷 苍古自由之誓".split(" ").map(appendStar(5)),
  star5_up_p: .5,
  star5_up_baodi: 1,
};

async function yuanshenChouka(chizi: YuanshenChizi, gid: number, uid: number) {
  const findRes = await collection.findOne({ gid, uid });
  const yuanshen_last_five = findRes?.yuanshen_last_five ?? 0;
  const yuanshen_last_four = findRes?.yuanshen_last_four ?? 0;
  const yuanshen_targeted_four = findRes?.yuanshen_targeted_four ?? 0;
  const yuanshen_targeted_five = findRes?.yuanshen_targeted_five ?? 0;

  let star = 3;
  if (yuanshen_last_five >= 89) star = 5;
  else if (yuanshen_last_four >= 9) star = 4;
  else {
    const random = Math.random();
    if (random < 0.006) star = 5;
    else if (random < 0.057) star = 4;
    else star = 3;
  }

  const now_last_four = star >= 4 ? 0 : yuanshen_last_four + 1;
  const now_last_five = star >= 5 ? 0 : yuanshen_last_five + 1;

  let res: string[] = [];
  let now_target_four = yuanshen_targeted_four;
  let now_target_five = yuanshen_targeted_five;
  if (star === 5) {
    if (
      chizi.star5_up_p &&
      (yuanshen_targeted_five >= chizi.star5_up_baodi ||
        Math.random() < chizi.star5_up_p)
    ) {
      res = chizi.star5_up;
      now_target_five = 0;
    } else {
      res = chizi.star5;
      now_target_five = yuanshen_targeted_five + 1;
    }
  }
  if (star === 4) {
    if (
      chizi.star4_up_p &&
      (yuanshen_targeted_four >= chizi.star4_up_baodi ||
        Math.random() < chizi.star4_up_p)
    ) {
      res = chizi.star4_up;
      now_target_four = 0;
    } else {
      res = chizi.star4;
      now_target_four = yuanshen_targeted_four + 1;
    }
  }
  if (star === 3) res = chizi.star3;

  await collection.updateOne({ gid, uid }, {
    $set: {
      yuanshen_last_four: now_last_four,
      yuanshen_last_five: now_last_five,
      yuanshen_targeted_four: now_target_four,
      yuanshen_targeted_five: now_target_five,
    },
  }, { upsert: true });

  return res[Math.floor(Math.random() * res.length)];
}

interface ArknightsChizi {
  star3: string[];
  star4: string[];
  star5: string[];
  star6: string[];
  star6_up: string[];
  star5_up: string[];
  star4_up: string[];
  star6_up_p: number;
  star5_up_p: number;
  star4_up_p: number;
}

// 能天使/推进之王/伊芙利特/艾雅法拉/安洁莉娜/闪灵/夜莺/星熊/塞雷娅/银灰/斯卡蒂/陈/黑/赫拉格/麦哲伦/莫斯提马/煌/阿/刻俄柏/风笛/傀影/温蒂/早露/铃兰/棘刺/森蚺/史尔特尔/瑕光/泥岩/山/空弦/嗟峨/异客/凯尔希/卡涅利安/帕拉斯
// 白面鸮/凛冬/德克萨斯/芙兰卡/拉普兰德/幽灵鲨/蓝毒/白金/陨星/天火/梅尔/赫默/华法琳/临光/红/雷蛇/可颂/普罗旺斯/守林人/崖心/初雪/真理/空/狮蝎/食铁兽/夜魔/诗怀雅/格劳克斯/星极/送葬人/槐琥/苇草/布洛卡/灰喉/哞/惊垫/慑砂/巫恋/极境/石棉/月禾/莱恩哈特/断崖/蜜蜡/贯维/安哲拉/燧石/四月/奥斯塔/絮雨/卡夫卡/爱丽丝/乌有/熔泉水/赤冬/绮良
// 夜烟/远山/杰西卡/流星/白雪/清道夫/红豆/杜宾/缠丸/霜叶/慕斯/砾/暗索/末药/调香师/角峰/蛇屠箱/古米/深海色/地灵/阿消/猎蜂/格雷伊/苏苏洛/桃金娘/红云/梅/安比尔/宴/刻刀/波登可/卡达/孑/酸糖/芳汀/泡泡/杰克/松果/豆苗/深靛

const ArknightsChangzhu: ArknightsChizi = {
  star6_up: "安洁莉娜/早露".split("/").map(appendStar(6)),
  star6_up_p: .5,
  star6:
    "能天使/推进之王/伊芙利特/艾雅法拉/闪灵/夜莺/星熊/塞雷娅/银灰/斯卡蒂/陈/黑/赫拉格/麦哲伦/莫斯提马/煌/阿/刻俄柏/风笛/傀影/温蒂/铃兰/棘刺/森蚺/史尔特尔/瑕光/泥岩/山/空弦/嗟峨/异客/凯尔希/卡涅利安/帕拉斯"
      .split("/").map(appendStar(6)),

  star5_up: "梅尔/普罗旺斯/乌有".split("/").map(appendStar(5)),
  star5_up_p: .5,
  star5:
    "白面鸮/凛冬/德克萨斯/芙兰卡/拉普兰德/幽灵鲨/蓝毒/白金/陨星/天火/赫默/华法琳/临光/红/雷蛇/可颂/守林人/崖心/初雪/真理/空/狮蝎/食铁兽/夜魔/诗怀雅/格劳克斯/星极/送葬人/槐琥/苇草/布洛卡/灰喉/哞/惊垫/慑砂/巫恋/极境/石棉/月禾/莱恩哈特/断崖/蜜蜡/贯维/安哲拉/燧石/四月/奥斯塔/絮雨/卡夫卡/爱丽丝/熔泉水/赤冬/绮良"
      .split("/").map(appendStar(5)),

  star4_up: [],
  star4_up_p: 0,
  star4:
    "夜烟/远山/杰西卡/流星/白雪/清道夫/红豆/杜宾/缠丸/霜叶/慕斯/砾/暗索/末药/调香师/角峰/蛇屠箱/古米/深海色/地灵/阿消/猎蜂/格雷伊/苏苏洛/桃金娘/红云/梅/安比尔/宴/刻刀/波登可/卡达/孑/酸糖/芳汀/泡泡/杰克/松果/豆苗/深靛"
      .split("/").map(appendStar(4)),

  star3: "芬/香草/翎羽/玫兰莎/卡缇/米格鲁/克洛丝/炎熔/芙蓉/安赛尔/史都华德/梓兰/空爆/月见夜/斑点/泡普卡".split("/")
    .map(appendStar(3)),
};

const ArknightsHuodong: ArknightsChizi = {
  star6_up: "假日威龙陈/水月/水月/水月/水月/水月/水月".split("/").map(appendStar(6)),
  star6_up_p: .7,
  star6:
    "能天使/推进之王/伊芙利特/艾雅法拉/安洁莉娜/闪灵/夜莺/星熊/塞雷娅/银灰/斯卡蒂/陈/黑/赫拉格/麦哲伦/莫斯提马/煌/阿/刻俄柏/风笛/傀影/温蒂/早露/铃兰/棘刺/森蚺/史尔特尔/瑕光/泥岩/山/空弦/嗟峨/异客/凯尔希/卡涅利安/帕拉斯"
      .split("/").map(appendStar(6)),

  star5_up: "羽毛笔".split("/").map(appendStar(5)),
  star5_up_p: .5,
  star5:
    "白面鸮/凛冬/德克萨斯/芙兰卡/拉普兰德/幽灵鲨/蓝毒/白金/陨星/天火/梅尔/赫默/华法琳/临光/红/雷蛇/可颂/普罗旺斯/守林人/崖心/初雪/真理/空/狮蝎/食铁兽/夜魔/诗怀雅/格劳克斯/星极/送葬人/槐琥/苇草/布洛卡/灰喉/哞/惊垫/慑砂/巫恋/极境/石棉/月禾/莱恩哈特/断崖/蜜蜡/贯维/安哲拉/燧石/四月/奥斯塔/絮雨/卡夫卡/爱丽丝/乌有/熔泉水/赤冬/绮良"
      .split("/").map(appendStar(5)),

  star4_up: "".split("/").map(appendStar(4)),
  star4_up_p: 0,
  star4:
    "夜烟/远山/杰西卡/流星/白雪/清道夫/红豆/杜宾/缠丸/霜叶/慕斯/砾/暗索/末药/调香师/角峰/蛇屠箱/古米/深海色/地灵/阿消/猎蜂/格雷伊/苏苏洛/桃金娘/红云/梅/安比尔/宴/刻刀/波登可/卡达/孑/芳汀/泡泡/杰克/松果/豆苗/深靛"
      .split("/").map(appendStar(4)),

  star3: "芬/香草/翎羽/玫兰莎/卡缇/米格鲁/克洛丝/炎熔/芙蓉/安赛尔/史都华德/梓兰/空爆/月见夜/斑点/泡普卡".split("/")
    .map(appendStar(3)),
};

async function arknightsChouka(
  chizi: ArknightsChizi,
  gid: number,
  uid: number,
) {
  const findRes = await collection.findOne({ gid, uid });
  const last_six_star = findRes?.arknights_last_six ?? 0;

  let six_p = 0.02;
  if (last_six_star >= 50) six_p += (last_six_star - 49) * 0.02;
  const random = Math.random();
  let star = 3;
  if (random < six_p) star = 6;
  else if (random < 0.1) star = 5;
  else if (random < 0.6) star = 4;
  else star = 3;

  const now_six_star = star === 6 ? 0 : last_six_star + 1;
  await collection.updateOne(
    { gid, uid },
    { $set: { arknights_last_six: now_six_star } },
    { upsert: true },
  );

  let res: string[] = [];
  if (star === 6) {
    res = Math.random() < chizi.star6_up_p ? chizi.star6_up : chizi.star6;
  }
  if (star === 5) {
    res = Math.random() < chizi.star5_up_p ? chizi.star5_up : chizi.star5;
  }
  if (star === 4) {
    res = Math.random() < chizi.star4_up_p ? chizi.star4_up : chizi.star4;
  }
  if (star === 3) res = chizi.star3;

  return res[Math.floor(Math.random() * res.length)];
}

interface Game {
  name: string;
  kachi: {
    type: string;
    name: string;
    chou(gid: number, uid: number): Promise<string>;
  }[];
}

const Yuanshen: Game = {
  name: "原神",
  kachi: [{
    type: "常驻池",
    name: "「奔行世间」常驻祈愿",
    chou: yuanshenChouka.bind(null, YuanshenChangzhu),
  }, {
    type: "角色池",
    name: "「叶落风随」活动祈愿",
    chou: yuanshenChouka.bind(null, YuanshenHuodong1),
  }, {
    type: "武器池",
    name: "「神铸赋形」活动祈愿",
    chou: yuanshenChouka.bind(null, YuanshenHuodong2),
  }],
};
const Arknights: Game = {
  name: "明日方舟",
  kachi: [{
    type: "常驻池",
    name: "常驻轮换池(7/22-8/5)",
    chou: arknightsChouka.bind(null, ArknightsChangzhu),
  }, {
    type: "活动池",
    name: "「盛夏之心」限时寻访",
    chou: arknightsChouka.bind(null, ArknightsHuodong),
  }],
};

const games = [Yuanshen, Arknights];

const helpText = `同时发送 [游戏名称][卡池类型][单抽|十连] 即可模拟抽卡
卡池列表：
${
  games.map((game) =>
    `【${game.name}】\n${
      game.kachi.map((chizi) => `${chizi.type} - ${chizi.name}`).join("\n")
    }`
  ).join("\n")
}`;

export const ChoukaPlugin: IPlugin = {
  name: "chouka",
  helpText,
  async onAllMessage(
    helper: IHelperReply,
    gid: number,
    uid: number,
    message: DeserializedMessage,
  ) {
    const text = messageText(message.messageChain);

    for (const game of games) {
      if (text.indexOf(game.name) > -1) {
        for (const kachi of game.kachi) {
          if (text.indexOf(kachi.type) > -1) {
            if (text.indexOf("单抽") > -1) {
              const result = await kachi.chou(gid, uid);
              helper.reply(`${kachi.name}\n${result}`);
              return;
            } else if (text.indexOf("十连") > -1) {
              const result = [];
              for (let i = 0; i < 10; ++i) {
                result.push(await kachi.chou(gid, uid));
              }
              helper.reply(`${kachi.name}\n${result.join("\n")}`);
              return;
            }
          }
        }
      }
    }
  },
};
