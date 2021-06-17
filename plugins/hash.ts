import { DeserializedMessage, IHelperReply, IPlugin } from "../types.ts";
import { messageText } from "../utils.ts";
import { createHash } from "../mod.ts";

const supported =
  "md2 md4 md5 ripemd160 ripemd320 sha1 sha224 sha256 sha384 sha512 sha3-224 sha3-256 sha3-384 sha3-512 keccak224 keccak256 keccak384 keccak512"
    .split(" ");

const helpText = "请回复需要计算哈希值的消息，支持的算法：" + supported.join(" ");

export const HashPlugin: IPlugin = {
  name: "hash",
  helpText,
  onAllMessage(
    helper: IHelperReply,
    _gid: number,
    _uid: number,
    message: DeserializedMessage,
  ) {
    const text = messageText(message.messageChain);
    for (const algo of supported) {
      if (text === algo) {
        if (message.quote) {
          const quoting = messageText(message.quote);
          const hash = createHash(algo as any);
          hash.update(quoting);
          helper.reply(hash.toString("hex"));
        } else {
          helper.reply(`请回复需要计算 ${algo} 哈希值的消息`);
        }
      }
    }
  },
};
