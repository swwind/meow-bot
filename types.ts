export interface IPlugin {
  initialize(ws: IHelper): void;
  onGroupMessage(ws: IHelper, gid: number, uid: number, message: String): void;
  onFriendMessage(ws: IHelper, uid: number, message: String): void;
}

export interface IHelper {
  sendGroupMessage(group: number, text: String): void;
  sendFriendMessage(user: number, text: String): void;
}
