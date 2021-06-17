import { DeserializedMessage, IHelper, IPlugin } from "../types.ts";
import { messageText } from "../utils.ts";
import { createHash } from "../mod.ts";

const supported =
  "md2 md4 md5 ripemd160 ripemd320 sha1 sha224 sha256 sha384 sha512 sha3-224 sha3-256 sha3-384 sha3-512 keccak224 keccak256 keccak384 keccak512"
    .split(" ");

const helpText = "请回复需要计算哈希值的消息，支持的算法：" + supported.join(" ");

export const HashPlugin: IPlugin = {
  name: "hash",
  helpText,
  onGroupMessage(
    ws: IHelper,
    gid: number,
    _uid: number,
    message: DeserializedMessage,
  ) {
    const text = messageText(message.messageChain);
    if (message.quote) {
      const quoting = messageText(message.quote);
      for (const algo of supported) {
        if (text === algo) {
          const hash = createHash(algo as any);
          hash.update(quoting);
          ws.sendGroupMessage(gid, hash.toString("hex"));
          return;
        }
      }
    }
  },
};
