import type {
  FriendInformation,
  GroupInformation,
  GroupMemberInformation,
  GroupPermission,
} from "./message.ts";

/** Bot 登录成功 */
export type BotOnlineEvent = {
  type: "BotOnlineEvent";
  /** 登录成功的 Bot 的 QQ 号 */
  qq: number;
};

/** Bot 主动离线 */
export type BotOfflineEvent = {
  type: "BotOfflineEventActive";
  /** 主动离线的 Bot 的 QQ 号 */
  qq: number;
};

/** Bot 被挤下线 */
export type BotOfflineEventForce = {
  type: "BotOfflineEventForce";
  /** 被挤下线的 Bot 的 QQ 号 */
  qq: number;
};

/** Bot 被服务器断开或因网络问题而掉线 */
export type BotOfflineEventDropped = {
  type: "BotOfflineEventDropped";
  /** 被服务器断开或因网络问题而掉线的 Bot 的 QQ 号 */
  qq: number;
};

/** Bot 主动重新登录 */
export type BotReloginEvent = {
  type: "BotReloginEvent";
  /** 主动重新登录的 Bot 的 QQ 号 */
  qq: number;
};

/** 好友输入状态改变 */
export type FriendInputStatusChangedEvent = {
  type: "FriendInputStatusChangedEvent";
  friend: FriendInformation;
  /** 当前输出状态是否正在输入 */
  inputting: boolean;
};

/** 好友昵称改变 */
export type FriendNickChangedEvent = {
  type: "FriendNickChangedEvent";
  friend: FriendInformation;
  /** 原昵称 */
  from: string;
  /** 新昵称 */
  to: string;
};

/**
 * Bot 在群里的权限被改变
 *
 * 操作人一定是群主
 */
export type BotGroupPermissionChangeEvent = {
  type: "BotGroupPermissionChangeEvent";
  /** Bot 的原权限 */
  origin: GroupPermission;
  /** Bot 的新权限 */
  current: GroupPermission;
  /** 权限改变所在的群信息 */
  group: GroupInformation;
};

/** Bot被禁言 */
export type BotMuteEvent = {
  type: "BotMuteEvent";
  /** 禁言时长，单位为秒 */
  durationSeconds: number;
  /** 操作的管理员或群主信息 */
  operator: GroupMemberInformation;
};

/** Bot 被取消禁言 */
export type BotUnmuteEvent = {
  type: "BotUnmuteEvent";
  /** 操作的管理员或群主信息 */
  operator: GroupMemberInformation;
};

/** Bot 加入了一个新群 */
export type BotJoinGroupEvent = {
  type: "BotJoinGroupEvent";
  group: GroupInformation;
  /** 如果被邀请入群的话，则为邀请人的 Member 对象 */
  invitor: GroupMemberInformation | null;
};

/** Bot 主动退出一个群 */
export type BotLeaveEventActive = {
  type: "BotLeaveEventActive";
  /** Bot 退出的群的信息 */
  group: GroupInformation;
};

/** Bot 被踢出一个群 */
export type BotLeaveEventKick = {
  type: "BotLeaveEventKick";
  /** Bot 被踢出的群的信息 */
  group: GroupInformation;
  /** Bot 被踢后获取操作人的 Member 对象 */
  operator: GroupMemberInformation | null;
};

/** 群消息撤回 */
export type GroupRecallEvent = {
  type: "GroupRecallEvent";
  /** 原消息发送者的 QQ 号 */
  authorId: number;
  /** 原消息 messageId */
  messageId: number;
  /** 原消息发送时间 */
  time: number;
  /** 消息撤回所在的群 */
  group: GroupInformation;
  /** 撤回消息的操作人，当 null 时为 bot 操作 */
  operator: GroupMemberInformation | null;
};

/** 好友消息撤回 */
export type FriendRecallEvent = {
  type: "FriendRecallEvent";
  /** 原消息发送者的 QQ 号 */
  authorId: number;
  /** 原消息 messageId */
  messageId: number;
  /** 原消息发送时间 */
  time: number;
  /** 好友 QQ 号或 Bot QQ 号 */
  operator: number;
};

/** 戳一戳事件 */
export type NudgeEvent = {
  type: "NudgeEvent";
  /** 动作发出者的 QQ 号 */
  fromId: number;
  /** 来源 */
  subject: {
    /** 来源的 QQ 号（好友）或群号 */
    id: number;
    /** 来源的类型，Friend 或 Group */
    kind: "Group" | "Friend";
  };
  /** 动作类型 */
  action: string;
  /** 自定义动作内容 */
  suffix: string;
  /** 动作目标的 QQ 号 */
  target: number;
};

/** 某个群名改变 */
export type GroupNameChangeEvent = {
  type: "GroupNameChangeEvent";
  /** 原群名 */
  origin: string;
  /** 新群名 */
  current: string;
  /** 群名改名的群信息 */
  group: GroupInformation;
  /** 操作的管理员或群主信息，当 null 时为 Bot 操作 */
  operator: GroupMemberInformation | null;
};

/** 某群入群公告改变 */
export type GroupEntranceAnnouncementChangeEvent = {
  type: "GroupEntranceAnnouncementChangeEvent";
  /** 原公告 */
  origin: string;
  /** 新公告 */
  current: string;
  /** 公告改变的群信息 */
  group: GroupInformation;
  /** 操作的管理员或群主信息，当 null 时为 Bot 操作 */
  operator: GroupMemberInformation | null;
};

/** 全员禁言 */
export type GroupMuteAllEvent = {
  type: "GroupMuteAllEvent";
  /** 原本是否处于全员禁言 */
  origin: boolean;
  /** 现在是否处于全员禁言 */
  current: boolean;
  /** 全员禁言的群信息 */
  group: GroupInformation;
  /** 操作的管理员或群主信息，当 null 时为 Bot 操作 */
  operator: GroupMemberInformation | null;
};

/** 匿名聊天 */
export type GroupAllowAnonymousChatEvent = {
  type: "GroupAllowAnonymousChatEvent";
  /** 原本匿名聊天是否开启 */
  origin: boolean;
  /** 现在匿名聊天是否开启 */
  current: boolean;
  /** 匿名聊天状态改变的群信息 */
  group: GroupInformation;
  /** 操作的管理员或群主信息，当 null 时为 Bot 操作 */
  operator: GroupMemberInformation | null;
};

/** 坦白说 */
export type GroupAllowConfessTalkEvent = {
  type: "GroupAllowConfessTalkEvent";
  /** 原本坦白说是否开启 */
  origin: boolean;
  /** 现在坦白说是否开启 */
  current: boolean;
  /** 坦白说状态改变的群信息 */
  group: GroupInformation;
  /** 是否 Bot 进行该操作 */
  isByBot: boolean;
};

/** 允许群员邀请好友加群 */
export type GroupAllowMemberInviteEvent = {
  type: "GroupAllowMemberInviteEvent";
  /** 原本是否允许群员邀请好友加群 */
  origin: boolean;
  /** 现在是否允许群员邀请好友加群 */
  current: boolean;
  /** 允许群员邀请好友加群状态改变的群信息 */
  group: GroupInformation;
  /** 操作的管理员或群主信息，当 null 时为 Bot 操作 */
  operator: GroupMemberInformation | null;
};

/** 新人入群的事件 */
export type MemberJoinEvent = {
  type: "MemberJoinEvent";
  /** 新人信息 */
  member: GroupMemberInformation;
  /** 如果被邀请入群的话，则为邀请人的 Member 对象 */
  invitor: GroupMemberInformation | null;
};

/** 成员被踢出群（该成员不是Bot） */
export type MemberLeaveEventKick = {
  type: "MemberLeaveEventKick";
  /** 被踢出群的成员信息 */
  member: GroupMemberInformation;
  /** 操作的管理员或群主信息，当 null 时为 Bot 操作 */
  operator: GroupMemberInformation | null;
};

/** 成员主动离群（该成员不是Bot） */
export type MemberLeaveEventQuit = {
  type: "MemberLeaveEventQuit";
  /** 离群的成员信息 */
  member: GroupMemberInformation;
};

/** 群成员群名片改动 */
export type MemberCardChangeEvent = {
  type: "MemberCardChangeEvent";
  /** 原本名片 */
  origin: string;
  /** 现在名片 */
  current: string;
  /** 名片改动的群员的信息 */
  member: GroupMemberInformation;
};

/** 群头衔改动（只有群主有操作限权） */
export type MemberSpecialTitleChangeEvent = {
  type: "MemberSpecialTitleChangeEvent";
  /** 原头衔 */
  origin: string;
  /** 现头衔 */
  current: string;
  /** 头衔改动的群员的信息 */
  member: GroupMemberInformation;
};

/** 成员权限改变的事件（该成员不是Bot） */
export type MemberPermissionChangeEvent = {
  type: "MemberPermissionChangeEvent";
  /** 原权限 */
  origin: GroupPermission;
  /** 现权限 */
  current: GroupPermission;
  /** 权限改动的群员的信息 */
  member: GroupMemberInformation;
};

/** 群成员被禁言事件（该成员不是Bot） */
export type MemberMuteEvent = {
  type: "MemberMuteEvent";
  /** 禁言时长，单位为秒 */
  durationSeconds: number;
  /** 被禁言的群员的信息 */
  member: GroupMemberInformation;
  /** 操作者的信息，当 null 时为 Bot 操作 */
  operator: GroupMemberInformation | null;
};

/** 群成员被取消禁言事件（该成员不是Bot） */
export type MemberUnmuteEvent = {
  type: "MemberUnmuteEvent";
  /** 被取消禁言的群员的信息 */
  member: GroupMemberInformation;
  /** 操作者的信息，当 null 时为 Bot 操作 */
  operator: GroupMemberInformation | null;
};

/** 群员称号改变 */
export type MemberHonorChangeEvent = {
  type: "MemberHonorChangeEvent";
  /** 群员称号改变的群员信息 */
  member: GroupMemberInformation;
  /** 称号变化行为：achieve 获得称号，lose 失去称号 */
  action: "achieve" | "lose";
  /** 称号名称 */
  honor: string;
};

/** 添加好友申请 */
export type NewFriendRequestEvent = {
  type: "NewFriendRequestEvent";
  /** 事件标识，响应该事件时的标识 */
  eventId: number;
  /** 申请人 QQ 号 */
  fromId: number;
  /** 申请人如果通过某个群添加好友，该项为该群群号；否则为0 */
  groupId: number;
  /** 申请人的昵称或群名片 */
  nick: string;
  /** 申请消息 */
  message: string;
};

/** 用户入群申请（Bot 需要有管理员权限） */
export type MemberJoinRequestEvent = {
  type: "MemberJoinRequestEvent";
  /** 事件标识，响应该事件时的标识 */
  eventId: number;
  /** 申请人 QQ 号 */
  fromId: number;
  /** 申请人申请入群的群号 */
  groupId: number;
  /** 申请人申请入群的群名称 */
  groupName: string;
  /** 申请人的昵称或群名片 */
  nick: string;
  /** 申请消息 */
  message: string;
};

/** Bot 被邀请入群申请 */
export type BotInvitedJoinGroupRequestEvent = {
  type: "BotInvitedJoinGroupRequestEvent";
  /** 事件标识，响应该事件时的标识 */
  eventId: number;
  /** 邀请人（好友）的 QQ 号 */
  fromId: number;
  /** 被邀请进入群的群号 */
  groupId: number;
  /** 被邀请进入群的群名称 */
  groupName: string;
  /** 邀请人（好友）的昵称 */
  nick: string;
  /** 邀请消息 */
  message: string;
};

/** 其他客户端上线 */
export type OtherClientOnlineEvent = {
  type: "OtherClientOnlineEvent";
  /** 其他客户端 */
  client: {
    /** 客户端标识号 */
    id: number;
    /** 客户端类型 */
    platform: string;
  };
  /** 详细设备类型 */
  kind: number | null;
};

/** 其他客户端下线 */
export type OtherClientOfflineEvent = {
  type: "OtherClientOfflineEvent";
  /** 其他客户端 */
  client: {
    /** 客户端标识号 */
    id: number;
    /** 客户端类型 */
    platform: string;
  };
};

/** 其他事件（不是消息） */
export type OtherEvent =
  | BotOnlineEvent
  | BotOfflineEvent
  | BotOfflineEventForce
  | BotOfflineEventDropped
  | BotReloginEvent
  | FriendInputStatusChangedEvent
  | FriendNickChangedEvent
  | BotGroupPermissionChangeEvent
  | BotMuteEvent
  | BotUnmuteEvent
  | BotJoinGroupEvent
  | BotLeaveEventActive
  | BotLeaveEventKick
  | GroupRecallEvent
  | FriendRecallEvent
  | NudgeEvent
  | GroupNameChangeEvent
  | GroupEntranceAnnouncementChangeEvent
  | GroupMuteAllEvent
  | GroupAllowAnonymousChatEvent
  | GroupAllowConfessTalkEvent
  | GroupAllowMemberInviteEvent
  | MemberJoinEvent
  | MemberLeaveEventKick
  | MemberLeaveEventQuit
  | MemberCardChangeEvent
  | MemberSpecialTitleChangeEvent
  | MemberPermissionChangeEvent
  | MemberMuteEvent
  | MemberUnmuteEvent
  | MemberHonorChangeEvent
  | NewFriendRequestEvent
  | MemberJoinRequestEvent
  | BotInvitedJoinGroupRequestEvent
  | OtherClientOnlineEvent
  | OtherClientOfflineEvent;
