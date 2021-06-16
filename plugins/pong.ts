import { IHelper, IPlugin, DeserializedMessage } from "../types.ts";

export const PongPlugin: IPlugin = {
  initialize(ws: IHelper) {
  },
  onGroupMessage(ws: IHelper, gid: number, uid: number, message: DeserializedMessage) {
    if (message.text === 'ping') {
      ws.sendGroupMessage(gid, 'pong');
      return;
    }
  },
  onFriendMessage(ws: IHelper, uid: number, message: DeserializedMessage) {
    if (message.text === 'ping') {
      ws.sendFriendMessage(uid, 'pong');
      return;
    }
  },
};
