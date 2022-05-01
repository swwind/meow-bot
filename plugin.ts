import { Http } from "./http.ts";
import { Webhook } from "./webhook.ts";

export type Plugin = (webhook: Webhook, http: Http) => void;
