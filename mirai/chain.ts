export type MessageSource = {
  type: "Source";
  /** 消息的识别号，用于引用回复（Source 类型永远为 chain 的第一个元素） */
  id: number;
  /** 时间戳 */
  time: number;
};

export type MessageQuote = {
  type: "Quote";

  /** 被引用回复的原消息的 messageId */
  id: number;
  /** 被引用回复的原消息所接收的群号，当为好友消息时为 0 */
  groupId: number;
  /** 被引用回复的原消息的发送者的 QQ 号 */
  senderId: number;
  /** 被引用回复的原消息的接收者者的 QQ 号（或群号） */
  targetId: number;
  /** 被引用回复的原消息的消息链对象 */
  origin: MessageChain;
};

export type MessageAt = {
  type: "At";
  /** 群员 QQ 号 */
  target: number;
  /** At 时显示的文字，发送消息时无效，自动使用群名片 */
  display: string;
};

export type MessageAtAll = {
  type: "AtAll";
};

export type MessageFace = {
  type: "Face";
  /** QQ 表情编号，可选，优先高于 name */
  faceId: number;
  /** QQ表情拼音，可选 */
  name: string;
};

export type MessagePlain = {
  type: "Plain";
  /** 文字消息 */
  text: string;
};

export type MessageImage = {
  type: "Image";
  /** 图片的 imageId，群图片与好友图片格式不同。不为空时将忽略 url 属性 */
  imageId: string;
  /** 图片的 URL，发送时可作网络图片的链接；接收时为腾讯图片服务器的链接，可用于图片下载 */
  url: string;
  /** 图片的路径，发送本地图片，路径相对于 JVM 工作路径，也可传入绝对路径。 */
  path: string;
  /** 图片的 Base64 编码 */
  base64: string;
};

export type MessageFlashImage = {
  type: "FlashImage";
  /** 图片的 imageId，群图片与好友图片格式不同。不为空时将忽略 url 属性 */
  imageId: string;
  /** 图片的 URL，发送时可作网络图片的链接；接收时为腾讯图片服务器的链接，可用于图片下载 */
  url: string;
  /** 图片的路径，发送本地图片，路径相对于 JVM 工作路径，也可传入绝对路径。 */
  path: string;
  /** 图片的 Base64 编码 */
  base64: string;
};

export type MessageVoice = {
  type: "Voice";
  /** 语音的 voiceId，不为空时将忽略 url 属性 */
  voiceId: string;
  /** 语音的 URL，发送时可作网络语音的链接；接收时为腾讯语音服务器的链接，可用于语音下载 */
  url: string;
  /** 语音的路径，发送本地语音，路径相对于 JVM 工作路径，也可传入绝对路径。 */
  path: string;
  /** 语音的 Base64 编码 */
  base64: string;
  /** 返回的语音长度, 发送消息时可以不传 */
  length: number;
};

export type MessageXml = {
  type: "Xml";
  /** XML 文本 */
  xml: string;
};

export type MessageJson = {
  type: "Json";
  /** JSON 文本 */
  json: string;
};

export type MessageApp = {
  type: "App";
  /** 内容 */
  content: string;
};

export type MessagePoke = {
  type: "Poke";
  name:
    | "Poke"
    | "ShowLove"
    | "Like"
    | "Heartbroken"
    | "SixSixSix"
    | "FangDaZhao";
};

export type MessageDice = {
  type: "Dice";
  /** 点数 */
  value: number;
};

export type MessageMarketFace = {
  type: "MarketFace";
  /** 商城表情唯一标识 */
  id: number;
  /** 表情显示名称 */
  name: string;
};

export type MessageMusicShare = {
  type: "MusicShare";
  /** 类型 */
  kind: string;
  /** 标题 */
  title: string;
  /** 概括 */
  summary: string;
  /** 跳转路径 */
  jumpUrl: string;
  /** 封面路径 */
  pictureUrl: string;
  /** 音源路径 */
  musicUrl: string;
  /** 简介 */
  brief: string;
};

export type MessageForward = {
  type: "Forward";
  /** 消息节点 */
  nodeList: {
    /** 发送人 QQ 号 */
    senderId: number;
    /** 发送时间 */
    time: number;
    /** 显示名称 */
    senderName: string;
    /** 消息数组 */
    messageChain: MessageChain;
    /** 可以只使用消息 messageId，从缓存中读取一条消息作为节点 */
    messageId: number;
  }[];
};

export type MessageFile = {
  type: "File";
  /** 文件识别 id */
  id: string;
  /** 文件名 */
  name: string;
  /** 文件大小 */
  size: number;
};

export type MessageMiraiCode = {
  type: "MiraiCode";
  /** MiraiCode */
  code: string;
};

/** 消息链成员 */
export type MessageChainItem =
  | MessageSource
  | MessageQuote
  | MessageAt
  | MessageAtAll
  | MessageFace
  | MessagePlain
  | MessageImage
  | MessageFlashImage
  | MessageVoice
  | MessageXml
  | MessageJson
  | MessageApp
  | MessagePoke
  | MessageDice
  | MessageMarketFace
  | MessageMusicShare
  | MessageForward
  | MessageFile
  | MessageMiraiCode;

/** 消息链 */
export type MessageChain = MessageChainItem[];
