import { DeserializedMessage, IHelper, IPlugin } from "../types.ts";

export const RSSPlugin: IPlugin = {
  initialize(ws: IHelper) {
  },
  onGroupMessage(
    ws: IHelper,
    gid: number,
    uid: number,
    message: DeserializedMessage,
  ) {
  },
  onFriendMessage(ws: IHelper, uid: number, message: DeserializedMessage) {
  },
};
