import { IHelper, IPlugin } from "../types.ts";

export const PongPlugin: IPlugin = {
  initialize(ws: IHelper) {
  },
  onGroupMessage(ws: IHelper, gid: number, uid: number, message: String) {
    if (message.indexOf('ping') > -1) {
      ws.sendGroupMessage(gid, 'pong');
    }
  },
  onFriendMessage(ws: IHelper, uid: number, message: String) {
  },
};
