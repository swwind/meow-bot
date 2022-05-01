import { Evt, serve } from "./deps.ts";
import { MiraiEvent } from "./mirai/event.ts";

export function createWebhook(port: number) {
  const evt = new Evt<MiraiEvent>();

  // 事件上报服务器
  serve(async (req) => {
    try {
      const data = await req.json();
      evt.post(data as MiraiEvent);
    } catch (_) {
      return new Response("Bad Request", { status: 400 });
    }
    return new Response(null, { status: 204 });
  }, { port });

  console.log("Webhook listening on port 8080");
  return evt;
}

export type Webhook = ReturnType<typeof createWebhook>;
