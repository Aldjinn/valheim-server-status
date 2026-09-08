"use strict";

require("dotenv-defaults").config();

const express = require("express");
const schedule = require("node-schedule");
const apiMetrics = require("prometheus-api-metrics");
const git = require("git-last-commit");

const telegram = require("./telegram.js");
const valheim = require("./valheim.js");
const config = require("./config.js");

const PORT = 13080;
const HOST = "0.0.0.0";

const app = express();
const router = express.Router();

// Only schedule a job if not running tests
if (!config.isTest) {
  const job = schedule.scheduleJob(config.valheim.queryCron, function () {
    valheim.queryServer();
  });
}

if (config.webhook.enabled) {
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
  if (config.cors.enabled) {
    res.setHeader("Access-Control-Allow-Origin", config.cors.allowOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
  }
  res.send(JSON.stringify(valheim.getGamedigResult(), null, "\t"));
});

router.get("/version", (req, res) => {
  git.getLastCommit(function (err, commit) {
    if (err) {
      console.error("Failed to read last commit:", err.message);
      res.status(500).send({ error: "commit info unavailable" });
      return;
    }

    let json = JSON.parse(JSON.stringify(commit));
    json.authoredOn = new Date(commit.authoredOn * 1000).toISOString();
    json.committedOn = new Date(commit.committedOn * 1000).toISOString();

    res.send(json);
  });
});

router.get("/", (req, res) => {
  res.send("valheim-server-status");
});

function main() {
  console.log("valheim-server-status");
  console.log(`VALHEIM_HOST=${config.valheim.host}`);
  console.log(`VALHEIM_PORT=${config.valheim.port}`);
  console.log(`VALHEIM_QUERY_CRON=${config.valheim.queryCron}`);
  console.log(`TELEGRAM_CHAT_ID=${config.telegram.chatId}`);
  console.log(`TELEGRAM_BOT=${config.telegram.bot}`);
  console.log(`TELEGRAM_STARTUP_MESSAGE=${config.telegram.startupMessage}`);
  console.log(`TELEGRAM_ENABLED=${config.telegram.enabled}`);
  console.log(`METRICS_ENABLED=${config.metrics.enabled}`);
  console.log(`WEBHOOK_ENABLED=${config.webhook.enabled}`);
  console.log(`CORS_ENABLED=${config.cors.enabled}`);
  console.log(`CORS_ALLOW_ORIGIN=${config.cors.allowOrigin}`);

  if (config.metrics.enabled) {
    app.use(apiMetrics());
  }

  app.use(express.json());
  app.use("/", router);
  const server = app.listen(PORT, HOST);

  const startMessage = `Valheim Server Status running on http://${HOST}:${PORT}`;
  console.log(startMessage);

  if (config.telegram.startupMessage) {
    telegram.sendTelegramMessage(startMessage);
  }

  valheim.queryServer();

  // Graceful shutdown: stop accepting connections and close cleanly
  function shutdown(signal) {
    console.log(`${signal} received, shutting down...`);
    server.close(() => {
      console.log("HTTP server closed, exiting.");
      process.exit(0);
    });
    // Force-exit if connections don't drain in time
    setTimeout(() => {
      console.error("Timed out waiting for connections, forcing exit.");
      process.exit(1);
    }, 10000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

if (require.main === module) {
  main();
} else {
  module.exports = router; // export router for testing
}
