import {
  MessageChain,
  MessageChainItem,
  MessagePlain,
  MessageQuote,
  MessageSource,
} from "./deps.ts";

await Deno.mkdir("cache", { recursive: true });

async function saveFile(filename: string, url: string) {
  const response = await fetch(url);

  await Deno.writeFile(
    `cache/${filename}`,
    new Uint8Array(await response.arrayBuffer()),
  );
}

async function cacheFile(filename: string, url: string) {
  try {
    const stat = await Deno.stat(`cache/${filename}`);
    if (stat.isFile) {
      return `cache/${filename}`;
    }
  } catch (_) {
    // ignore
  }

  await saveFile(filename, url);
  return `cache/${filename}`;
}

export async function cacheMessage(
  messageChain: MessageChain,
): Promise<MessageChain> {
  return (
    await Promise.all(
      messageChain.map(async (message): Promise<MessageChainItem | null> => {
        if (message.type === "Source") {
          return null;
        }

        if (message.type === "Image" || message.type === "FlashImage") {
          return {
            type: "Image",
            path: await Deno.realPath(
              await cacheFile(message.imageId!, message.url!),
            ),
          };
        }

        return message;
      }),
    )
  ).filter((message): message is MessageChainItem => message !== null);
}

export function extractText(messageChain: MessageChain) {
  return messageChain
    .filter((msg): msg is MessagePlain => msg.type === "Plain")
    .map((msg) => msg.text)
    .join(" ")
    .trim();
}

export function extractSource(messageChain: MessageChain) {
  return messageChain.find(
    (msg): msg is MessageSource => msg.type === "Source",
  );
}

export function extractQuote(messageChain: MessageChain) {
  return messageChain.find((msg): msg is MessageQuote => msg.type === "Quote");
}
