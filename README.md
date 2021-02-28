# valheim-server-status

Fetches some basic informations from your Valheim server and sends (optionally) messages to Telegram if a player joins or leaves your server.

Used libraries:

- query server data: [node-GameDig](https://github.com/gamedig/node-gamedig)
- cronjobs: [node-schedule](https://github.com/node-schedule/node-schedule)
- webserver: [express](https://github.com/expressjs/express)
- http client: [axios](https://github.com/axios/axios)
- env variable handling: [dotenv-defaults](https://github.com/mrsteele/dotenv-defaults)

## Development

First, install [Node.js](https://nodejs.org/) locally. Then create an .env file to override values from .env.defaults.

```bash
npm install
node server.js
```

Now open http://localhost:13080/ in your browser.

## Docker

First create a docker-compose.yml file based on the docker-compose.example.yml. Adjust the environment variables to your needs.

```bash
docker-compose build
docker-compose up
```

Now open http://localhost:13080/ in your browser again.

## Telegram

If you have configured the Telegram settings correctly, a similar message should be sent to your chat after the application has started. As well if someone joines or leaves the server.

![telegram.png)](telegram.png)
