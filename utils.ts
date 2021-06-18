import { IMessageChain } from "./types.ts";
import { MongoClient } from "./deps.ts";

const client = new MongoClient();
await client.connect("mongodb://127.0.0.1:27017");
const db = client.database("meow-bot");

export function getCollection<T>(name: string) {
  return db.collection<T>(name);
}

export function messageText(messageChain: IMessageChain) {
  return messageChain.map((message) => {
    if (message.type === "At") {
      return "@" + (message.display || message.target);
    }
    if (message.type === "Plain") return message.text;
    if (message.type === "Image") return `![picture](${message.imageId})`;
    if (message.type === "Face") return "/" + message.name;
    if (message.type === "Source") return "";
    if (message.type === "Quote") return "";
    return "";
  }).join("").trim();
}
