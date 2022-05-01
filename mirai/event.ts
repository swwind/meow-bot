import type { OtherEvent } from "./event/other.ts";
import type { MessageEvent } from "./event/message.ts";

/** mirai 的全部事件类型 */
export type MiraiEvent = MessageEvent | OtherEvent;
