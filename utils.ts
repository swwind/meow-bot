import { IMessageChain } from "./types.ts";

export class Storage<K, V> {
  private map: Map<K, V>;
  private partition: string;

  constructor(partition: string) {
    this.partition = partition;
    try {
      const data = Deno.readTextFileSync("data/" + partition);
      this.map = new Map(JSON.parse(data));
    } catch (e) {
      this.map = new Map();
    }
  }

  private write() {
    Deno.writeTextFile(
      "data/" + this.partition,
      JSON.stringify(Array.from(this.map)),
    );
  }

  has(key: K) {
    return this.map.has(key);
  }

  delete(key: K) {
    const result = this.map.delete(key);
    this.write();
    return result;
  }

  get(key: K) {
    return this.map.get(key);
  }

  getOr(key: K, defs: V) {
    return this.map.get(key) ?? defs;
  }

  set(key: K, value: V) {
    const result = this.map.set(key, value);
    this.write();
    return result;
  }

  keys() {
    return Array.from(this.map.keys());
  }
}

export function messageText(messageChain: IMessageChain) {
  return messageChain.map((message) => {
    if (message.type === "At") {
      return "@" + (message.display || message.target);
    }
    if (message.type === "Plain") return message.text;
    if (message.type === "Image") return "[图片]";
    if (message.type === "Face") return "/" + message.name;
    if (message.type === "Source") return "";
    if (message.type === "Quote") return "";
    return "";
  }).join("").trim();
}
