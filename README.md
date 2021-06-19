# Meow bot

For personal fun. PR welcome.

Hosted on my own server, which run Mirai-Console, RSSHub and mongodb at the same
time with only 2G memory.

## Deploy

Make sure deno 1.10.3 installed.

1. Install mirai-console and mirai-api-http, you need to work it out yourself.

2. Configure mirai-api-http as following:

   ```yaml
   adapters:
     - ws
   debug: false
   enableVerify: true
   verifyKey: flag{XPibXaidcb9DvMFcS4rw}
   singleMode: false
   cacheSize: 4096
   adapterSettings:
     ws:
       host: localhost
       port: 21414
   ```

   Then copy your verify key to `/flag`

   ```bash
   echo -n "flag{XPibXaidcb9DvMFcS4rw}" > /flag
   ```

3. Upload bundled script to your server

   ```bash
   deno bundle --unstable main.ts > main.js
   scp -i xxx.pem main.js root@xxx.xxx.xxx:/root/main.js
   ```

4. On your server, install it to systemd.

   ```bash
   echo "
   [Unit]
   Description=A meow bot service
   After=network.target

   [Service]
   WorkingDirectory=$(pwd)
   ExecStart=$(which deno) run -A --unstable /root/main.js

   [Install]
   WantedBy=multi-user.target
   " | sudo tee /usr/lib/systemd/system/meow-bot.service
   sudo systemctl enable --now meow-bot.service
   ```

5. In order to make `setu` plugin work, you need to put all your setu into `/root/setu/`.
