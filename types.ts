export type IMessage =
  | {
    type: "Plain";
    text: string;
  }
  | {
    type: "Image";
    url: string;
    imageId: string;
    path: null;
    base64: null;
  }
  | {
    type: "At";
    display: string;
    target: number;
  }
  | {
    type: "Source";
    id: number;
    time: number;
  }
  | {
    type: "Face";
    faceId: number;
    name: string;
  }
  | {
    type: "Quote";
    id: number;
    senderId: number;
    targetId: number;
    groupId: number;
    origin: IMessageChain;
  };

export type IMessageChain = IMessage[];

export interface DeserializedMessage {
  messageChain: IMessageChain;
  quote: IMessageChain | null;
}

export interface IPlugin {
  name: string;
  helpText: string;
  initialize?(ws: IHelper): void;
  onGroupMessage?(
    ws: IHelper,
    gid: number,
    uid: number,
    message: DeserializedMessage,
  ): void;
  onFriendMessage?(
    ws: IHelper,
    uid: number,
    message: DeserializedMessage,
  ): void;
}

export interface IHelper {
  sendGroupMessage(group: number, text: String | IMessageChain): void;
  sendFriendMessage(user: number, text: String | IMessageChain): void;
}
