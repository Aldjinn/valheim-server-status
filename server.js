"use strict";

require("dotenv-defaults").config();

const express = require("express");
const schedule = require("node-schedule");
const apiMetrics = require("prometheus-api-metrics");

const telegram = require("./telegram.js");
const valheim = require("./valheim.js");

const PORT = 13080;
const HOST = "0.0.0.0";

const app = express();
const router = express.Router();

const job = schedule.scheduleJob(process.env.VALHEIM_QUERY_CRON, function () {
  valheim.queryServer();
});

if (process.env.WEBHOOK_ENABLED === "true") {
  router.post("/webhook", (req, res) => {
    console.log(req.body);
    telegram.sendTelegramMessage(
      "Valheim Server: " + JSON.stringify(req.body, null, "\t")
    );
    res.sendStatus(204);
  });
}

router.get("/status", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (process.env.CORS_ENABLED === "true") {
    res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ALLOW_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  }
  res.send(JSON.stringify(valheim.getGamedigResult(), null, "\t"));
});

router.get("/", (req, res) => {
  res.send("valheim-server-status");
});

function main() {
  console.log("valheim-server-status");
  console.log(`VALHEIM_HOST=${process.env.VALHEIM_HOST}`);
  console.log(`VALHEIM_PORT=${process.env.VALHEIM_PORT}`);
  console.log(`VALHEIM_QUERY_CRON=${process.env.VALHEIM_QUERY_CRON}`);
  console.log(`TELEGRAM_CHAT_ID=${process.env.TELEGRAM_CHAT_ID}`);
  console.log(`TELEGRAM_BOT=${process.env.TELEGRAM_BOT}`);
  console.log(
    `TELEGRAM_STARTUP_MESSAGE=${process.env.TELEGRAM_STARTUP_MESSAGE}`
  );
  console.log(`TELEGRAM_ENABLED=${process.env.TELEGRAM_ENABLED}`);
  console.log(`METRICS_ENABLED=${process.env.METRICS_ENABLED}`);
  console.log(`WEBHOOK_ENABLED=${process.env.WEBHOOK_ENABLED}`);
  console.log(`CORS_ENABLED=${process.env.CORS_ENABLED}`);
  console.log(`CORS_ALLOW_ORIGIN=${process.env.CORS_ALLOW_ORIGIN}`);

  if (process.env.METRICS_ENABLED === "true") {
    app.use(apiMetrics());
  }

  app.use(express.json());
  app.use("/", router);
  app.listen(PORT, HOST);

  const startMessage = `Valheim Server Status running on http://${HOST}:${PORT}`;
  console.log(startMessage);

  if (process.env.TELEGRAM_STARTUP_MESSAGE === "true") {
    telegram.sendTelegramMessage(startMessage);
  }

  valheim.queryServer();
}

if (require.main === module) {
  main();
}
