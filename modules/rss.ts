import { IHelper, IPlugin } from "../types.ts";

export const RSSPlugin: IPlugin = {
  initialize(ws: IHelper) {
  },
  onGroupMessage(ws: IHelper, gid: number, uid: number, message: String) {
  },
  onFriendMessage(ws: IHelper, uid: number, message: String) {
  },
};
