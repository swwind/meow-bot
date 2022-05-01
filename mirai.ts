import { Http } from "./http.ts";
import { Plugin } from "./plugin.ts";
import { Webhook } from "./webhook.ts";

export class Mirai {
  constructor(
    private readonly webhook: Webhook,
    private readonly http: Http,
  ) {
    http.about().then((result) =>
      console.log(`connected to Mirai-Api-Http v${result.data.version}`)
    );
  }

  addPlugin(plugin: Plugin) {
    plugin(this.webhook, this.http);
  }
}
