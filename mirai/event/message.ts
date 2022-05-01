import type { MessageChain } from "../chain.ts";

/** 好友信息 */
export type FriendInformation = {
  /** 好友 QQ 号码 */
  id: number;
  /** 好友昵称 */
  nickname: string;
  /** 好友备注 */
  remark: string;
};

/** 群组信息 */
export type GroupInformation = {
  /** 群号 */
  id: number;
  /** 群名 */
  name: string;
  /** **Bot** 在群中的权限 */
  permission: GroupPermission;
};

/** 群权限 */
export type GroupPermission = "OWNER" | "MEMBER" | "ADMINISTRATOR";

/** 群成员信息 */
export type GroupMemberInformation = {
  /** QQ 号 */
  id: number;
  /** 群名片 */
  memberName: string;
  /** 群头衔 */
  specialTitle: string;
  /** 在群中的权限 */
  permission: GroupPermission;
  joinTimestamp: number;
  lastSpeakTimestamp: number;
  muteTimeRemaining: number;
  group: GroupInformation;
};

/** 好友消息 */
export type FriendMessage = {
  type: "FriendMessage";
  sender: FriendInformation;
  messageChain: MessageChain;
};

/** 群消息 */
export type GroupMessage = {
  type: "GroupMessage";
  sender: GroupMemberInformation;
  messageChain: MessageChain;
};

/** 群临时消息 */
export type TempMessage = {
  type: "TempMessage";
  sender: GroupMemberInformation;
  messageChain: MessageChain;
};

/** 陌生人消息 */
export type StrangeMessage = {
  type: "StrangeMessage";
  sender: FriendInformation;
  messageChain: MessageChain;
};

/** 其他客户端消息 */
export type OtherClientMessage = {
  type: "OtherClientMessage";
  sender: {
    id: number;
    platform: string;
  };
  messageChain: MessageChain;
};

/** 同步好友消息 */
export type FriendSyncMessage = {
  type: "FriendSyncMessage";
  sender: FriendInformation;
  messageChain: MessageChain;
};

/** 同步群消息 */
export type GroupSyncMessage = {
  type: "GroupSyncMessage";
  sender: GroupMemberInformation;
  messageChain: MessageChain;
};

/** 同步群临时消息 */
export type TempSyncMessage = {
  type: "TempSyncMessage";
  sender: GroupMemberInformation;
  messageChain: MessageChain;
};

/** 同步陌生人消息 */
export type StrangeSyncMessage = {
  type: "StrangeSyncMessage";
  sender: FriendInformation;
  messageChain: MessageChain;
};

/** 消息事件 */
export type MessageEvent =
  | FriendMessage
  | GroupMessage
  | TempMessage
  | StrangeMessage
  | OtherClientMessage
  | FriendSyncMessage
  | GroupSyncMessage
  | TempSyncMessage
  | StrangeSyncMessage;
