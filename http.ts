import { MessageChain } from "./mirai/chain.ts";
import {
  FriendInformation,
  GroupInformation,
  GroupMemberInformation,
  MessageEvent,
} from "./mirai/event/message.ts";

export function createHttp(url: string) {
  console.log(`HTTP adapter targeted to ${url}`);

  type ResponseHeader = {
    code: number;
    msg: string;
  };

  type ResponseData<T> = ResponseHeader & {
    data: T;
  };

  const post = async <R, T>(path: string, data: T): Promise<R> => {
    const response = await fetch(`${url}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json() as R;
  };

  const get = async <R>(path: string): Promise<R> => {
    const response = await fetch(`${url}${path}`, { method: "GET" });
    return await response.json() as R;
  };

  type PluginInformation = {
    version: string;
  };

  /** 获取插件信息 */
  const about = () => get<ResponseData<PluginInformation>>("/about");

  /** 通过 messageId 获取消息 */
  const messageFromId = (
    /** 获取消息的 messageId */
    id: number,
  ) => get<ResponseData<MessageEvent>>(`/messageFromId?id=${id}`);

  /** 获取好友列表 */
  const friendList = () =>
    get<ResponseData<FriendInformation[]>>("/friendList");

  /** 获取群列表 */
  const groupList = () => get<ResponseData<GroupInformation[]>>("/groupList");

  /** 获取群成员列表 */
  const groupMemberList = (
    /** 指定群的群号 */
    target: number,
  ) =>
    get<ResponseData<GroupMemberInformation[]>>(
      `/groupMemberList?target=${target}`,
    );

  type PersonalInformation = {
    /** 昵称 */
    nickname: string;
    /** 邮箱 */
    email: string;
    /** 年龄 */
    age: number;
    /** 等级 */
    level: number;
    /** 个性签名 */
    sign: string;
    /** 性别（也许应该添加更多？） */
    sex: "UNKNOWN" | "MALE" | "FEMALE";
  };

  /** 获取 Bot 资料 */
  const botProfile = () => get<PersonalInformation>("/botProfile");

  /** 获取好友资料 */
  const friendProfile = (
    /** 指定好友账号 */
    target: number,
  ) => get<PersonalInformation>(`/friendProfile?target=${target}`);

  /** 获取群成员资料 */
  const memberProfile = (
    /** 指定群的群号 */
    target: number,
    /** 群成员 QQ 号码 */
    memberId: number,
  ) =>
    get<PersonalInformation>(
      `/memberProfile?target=${target}&memberId=${memberId}`,
    );

  /** 获取 QQ 用户资料 */
  const userProfile = (
    /** 要查询的 QQ 号码 */
    target: number,
  ) => get<PersonalInformation>(`/userProfile?target=${target}`);

  type SendMessage = {
    /** 发送消息目标好友的 QQ 号（或者群号） */
    target: number;
    /** 引用一条消息的 messageId 进行回复 */
    quote?: number;
    /** 消息链，是一个消息对象构成的数组 */
    messageChain: MessageChain;
  };

  /** 发送好友消息 */
  const sendFriendMessage = (data: SendMessage) =>
    post<
      ResponseHeader & {
        /** 标识本条消息，用于撤回和引用回复 */
        messageId: number;
      },
      SendMessage
    >("/sendFriendMessage", data);

  /** 发送群消息 */
  const sendGroupMessage = (data: SendMessage) =>
    post<
      ResponseHeader & {
        /** 标识本条消息，用于撤回和引用回复 */
        messageId: number;
      },
      SendMessage
    >("/sendGroupMessage", data);

  /** 发送临时会话消息 */
  const sendTempMessage = (data: SendMessage) =>
    post<
      ResponseHeader & {
        /** 标识本条消息，用于撤回和引用回复 */
        messageId: number;
      },
      SendMessage
    >("/sendTempMessage", data);

  type SendNudge = {
    /** 戳一戳的目标, QQ号, 可以为 bot QQ号 */
    target: number;
    /** 戳一戳接受主体(上下文), 戳一戳信息会发送至该主体, 为群号/好友QQ号 */
    subject: number;
    /** 上下文类型, 可选值 Friend, Group, Stranger */
    kind: "Group" | "Friend" | "Stranger";
  };

  /** 发送头像戳一戳消息 */
  const sendNudge = (
    data: SendNudge,
  ) => post<ResponseHeader, SendNudge>("/sendNudge", data);

  type Recall = {
    /** 需要撤回的消息的 messageId */
    target: number;
  };

  /** 撤回消息 */
  const recall = (
    data: Recall,
  ) => post<ResponseHeader, Recall>("/recall", data);

  // TODO: 文件部分懒得搞了

  type DeleteFriend = {
    /** 删除好友的 QQ 号 */
    target: number;
  };

  /** 删除好友 */
  const deleteFriend = (
    data: DeleteFriend,
  ) => post<ResponseHeader, DeleteFriend>("/deleteFriend", data);

  type Mute = {
    /** 指定群的群号 */
    target: number;
    /** 指定群员 QQ 号 */
    memberId: number;
    /** 禁言时长，单位为秒，最多30天 */
    time: number;
  };

  /** 禁言群成员 */
  const mute = (
    data: Mute,
  ) => post<ResponseHeader, Mute>("/mute", data);

  type Unmute = {
    /** 指定群的群号 */
    target: number;
    /** 指定群员 QQ 号 */
    memberId: number;
  };

  /** 解除群成员禁言 */
  const unmute = (
    data: Unmute,
  ) => post<ResponseHeader, Unmute>("/unmute", data);

  type Kick = {
    /** 指定群的群号 */
    target: number;
    /** 指定群员 QQ 号 */
    memberId: number;
    /** 信息 */
    msg?: string;
  };

  /** 移除群成员 */
  const kick = (
    data: Kick,
  ) => post<ResponseHeader, Kick>("/kick", data);

  type Quit = {
    /** 指定群的群号 */
    target: number;
  };

  /** 退出群聊 */
  const quit = (
    data: Quit,
  ) => post<ResponseHeader, Quit>("/quit", data);

  type MuteAll = {
    /** 指定群的群号 */
    target: number;
  };

  /** 全体禁言 */
  const muteAll = (
    data: MuteAll,
  ) => post<ResponseHeader, MuteAll>("/muteAll", data);

  type UnmuteAll = {
    /** 指定群的群号 */
    target: number;
  };

  /** 解除全体禁言 */
  const unmuteAll = (
    data: UnmuteAll,
  ) => post<ResponseHeader, UnmuteAll>("/unmuteAll", data);

  type SetEssence = {
    /** 精华消息的 messageId */
    target: number;
  };

  /** 设置群精华消息 */
  const setEssence = (
    data: SetEssence,
  ) => post<ResponseHeader, SetEssence>("/setEssence", data);

  type GroupConfig = {
    /** 群名 */
    name: string;
    /** 群公告 */
    announcement: string;
    /** 是否开启坦白说 */
    confessTalk: boolean;
    /** 是否允许群员邀请 */
    allowMemberInvite: boolean;
    /** 是否开启自动审批入群 */
    autoApprove: boolean;
    /** 是否允许匿名聊天 */
    anonymousChat: boolean;
  };

  /** 获取群设置 */
  const getGroupConfig = (
    /** 指定群的群号 */
    target: number,
  ) => get<GroupConfig>(`/groupConfig?target=${target}`);

  type SetGroupConfig = {
    /** 指定群的群号 */
    target: number;
    /** 群设置 */
    config: GroupConfig;
  };

  /** 修改群设置 */
  const setGroupConfig = (
    data: SetGroupConfig,
  ) => post<ResponseHeader, SetGroupConfig>("/groupConfig", data);

  /** 获取群员设置 */
  const getMemberInfo = (
    /** 指定群的群号 */
    target: number,
    /** 群员 QQ 号 */
    memberId: number,
  ) =>
    get<GroupMemberInformation>(
      `/memberInfo?target=${target}&memberId=${memberId}`,
    );

  type SetMemberInfo = {
    /** 指定群的群号 */
    target: number;
    /** 群员 QQ 号 */
    memberId: number;
    /** 群员资料 */
    info: {
      /** 群名片，即群昵称 */
      name?: string;
      /** 群头衔 */
      specialTitle?: string;
    };
  };

  /** 修改群员设置 */
  const setMemberInfo = (
    data: SetMemberInfo,
  ) => post<ResponseHeader, SetMemberInfo>("/memberInfo", data);

  type MemberAdmin = {
    /** 指定群的群号 */
    target: number;
    /** 群员 QQ 号 */
    memberId: number;
    /** 是否设置为管理员 */
    assign: boolean;
  };

  /** 修改群员管理员 */
  const memberAdmin = (
    data: MemberAdmin,
  ) => post<ResponseHeader, MemberAdmin>("/memberAdmin", data);

  type GroupAnnouncement = {
    /** 群组信息 */
    group: GroupInformation;
    /** 群公告内容 */
    content: string;
    /** 发布者账号 */
    senderId: number;
    /** 公告唯一 id */
    fid: string;
    /** 是否所有群成员已确认 */
    allConfirmed: false;
    /** 确认群成员人数 */
    confirmedMembersCount: 0;
    /** 发布时间 */
    publicationTime: number;
  };

  /** 获取群公告 */
  const annoList = (
    /** 指定群的群号 */
    target: number,
  ) => get<ResponseData<GroupAnnouncement[]>>(`/anno/list?target=${target}`);

  type AnnoPublish = {
    /** 群号 */
    target: number;

    /** 公告内容 */
    content: string;
    /** 是否发送给新成员 */
    sendToNewMember?: boolean;
    /** 是否置顶 */
    pinned?: boolean;
    /** 是否显示群成员修改群名片的引导 */
    showEditCard?: boolean;
    /** 是否自动弹出 */
    showPopup?: boolean;
    /** 是否需要群成员确认 */
    requireConfirmation?: boolean;

    /** 公告图片 url */
    imageUrl?: string;
    /** 公告图片本地路径 */
    imagePath?: string;
    /** 公告图片 base64 编码 */
    imageBase64?: string;
  };

  /** 发布群公告 */
  const annoPublish = (
    data: AnnoPublish,
  ) =>
    post<ResponseData<GroupAnnouncement[]>, AnnoPublish>("/anno/publish", data);

  type AnnoDelete = {
    /** 群号 */
    id: number;
    /** 群公告唯一 id */
    fid: string;
  };

  /** 删除群公告 */
  const annoDelete = (
    data: AnnoDelete,
  ) => post<ResponseHeader, AnnoDelete>("/anno/delete", data);

  type HandleNewFriendRequest = {
    /** 响应申请事件的标识 */
    eventId: number;
    /** 事件对应申请人 QQ 号 */
    fromId: number;
    /** 事件对应申请人的群号，可能为 0 */
    groupId: number;
    /**
     * 响应的操作类型
     *
     * - 0: 同意添加好友
     * - 1: 拒绝添加好友
     * - 2: 拒绝添加好友并添加黑名单，不再接收该用户的好友申请
     */
    operate: 0 | 1 | 2;
    /** 回复的信息 */
    message: string;
  };

  /** 处理添加好友申请 */
  const handleNewFriendRequest = (
    data: HandleNewFriendRequest,
  ) =>
    post<ResponseHeader, HandleNewFriendRequest>(
      "/resp/newFriendRequestEvent",
      data,
    );

  type HandleMemberJoinRequest = {
    /** 响应申请事件的标识 */
    eventId: number;
    /** 事件对应申请人 QQ 号 */
    fromId: number;
    /** 事件对应申请人的群号 */
    groupId: number;
    /**
     * 响应的操作类型
     *
     * - 0: 同意入群
     * - 1: 拒绝入群
     * - 2: 忽略请求
     * - 3: 拒绝入群并添加黑名单，不再接收该用户的入群申请
     * - 4: 忽略入群并添加黑名单，不再接收该用户的入群申请
     */
    operate: 0 | 1 | 2 | 3 | 4;
    /** 回复的信息 */
    message: string;
  };

  /** 用户入群申请（Bot 需要有管理员权限） */
  const handleMemberJoinRequest = (
    data: HandleMemberJoinRequest,
  ) =>
    post<ResponseHeader, HandleMemberJoinRequest>(
      "/resp/memberJoinRequestEvent",
      data,
    );

  type HandleBotInvitedJoinGroupRequest = {
    /** 事件标识 */
    eventId: number;
    /** 邀请人（好友）的 QQ 号 */
    fromId: number;
    /** 被邀请进入群的群号 */
    groupId: number;
    /**
     * 响应的操作类型
     *
     * - 0: 同意邀请
     * - 1: 拒绝邀请
     */
    operate: 0 | 1;
    /** 回复的信息 */
    message: string;
  };

  /** Bot 被邀请入群申请 */
  const handleBotInvitedJoinGroupRequest = (
    data: HandleBotInvitedJoinGroupRequest,
  ) =>
    post<ResponseHeader, HandleBotInvitedJoinGroupRequest>(
      "/resp/botInvitedJoinGroupRequestEvent",
      data,
    );

  return {
    about,
    messageFromId,
    friendList,
    groupList,
    groupMemberList,
    botProfile,
    friendProfile,
    memberProfile,
    userProfile,
    sendFriendMessage,
    sendGroupMessage,
    sendTempMessage,
    sendNudge,
    recall,
    deleteFriend,
    mute,
    unmute,
    kick,
    quit,
    muteAll,
    unmuteAll,
    setEssence,
    getGroupConfig,
    setGroupConfig,
    getMemberInfo,
    setMemberInfo,
    memberAdmin,
    annoList,
    annoPublish,
    annoDelete,
    handleNewFriendRequest,
    handleMemberJoinRequest,
    handleBotInvitedJoinGroupRequest,
  };
}

export type Http = ReturnType<typeof createHttp>;
