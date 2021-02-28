"use strict";

require("dotenv-defaults").config();

const express = require("express");
const schedule = require("node-schedule");
const gamedig = require("gamedig");
const axios = require("axios");

const PORT = 13080;
const HOST = "0.0.0.0";

let gamedigResult = "No query yet!";
let currentNumberOfPlayers = -1;

const app = express();
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(gamedigResult, null, "\t"));
});

const job = schedule.scheduleJob(process.env.VALHEIM_QUERY_CRON, function () {
  queryServer();
});

function queryServer() {
  gamedig
    .query({
      type: "valheim",
      host: process.env.VALHEIM_HOST,
      port: process.env.VALHEIM_PORT,
      debug: false,
      requestRules: true,
    })
    .then((state) => {
      // add querydate to result
      let json = JSON.parse(JSON.stringify(state));
      json.querydate = new Date().toISOString();
      gamedigResult = json;

      console.log(gamedigResult);
      checkPlayerLeftOrJoined();
    })
    .catch((error) => {
      console.log("Server is offline: " + error);
    });
}

function checkPlayerLeftOrJoined() {
  console.log(
    "there are currently " +
      gamedigResult.players.length +
      " players on the server"
  );

  if (currentNumberOfPlayers < 0) {
    currentNumberOfPlayers = gamedigResult.players.length;
  } else {
    if (currentNumberOfPlayers != gamedigResult.players.length) {
      console.log(
        "number of players has changed from " +
          currentNumberOfPlayers +
          " to " +
          gamedigResult.players.length
      );

      if (currentNumberOfPlayers < gamedigResult.players.length) {
        sendTelegramMessage("Valheim Server: Player joined.");
      } else {
        sendTelegramMessage("Valheim Server: Player left.");
      }
    }
    currentNumberOfPlayers = gamedigResult.players.length;
  }
}

function sendTelegramMessage(message) {
  if (process.env.TELEGRAM_ENABLED === "true") {
    const data = {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      disable_notification: true,
    };
    console.log("sendTelegramMessage: " + message);
    axios
      .post(
        "https://api.telegram.org/" + process.env.TELEGRAM_BOT + "/sendMessage",
        data
      )
      .then((res) => {
        console.log(`sendTelegramMessage: ${res.status}`);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

function main() {
  console.log("valheim-server-status");
  console.log(`VALHEIM_HOST=${process.env.VALHEIM_HOST}`);
  console.log(`VALHEIM_PORT=${process.env.VALHEIM_PORT}`);
  console.log(`VALHEIM_QUERY_CRON=${process.env.VALHEIM_QUERY_CRON}`);
  console.log(`TELEGRAM_CHAT_ID=${process.env.TELEGRAM_CHAT_ID}`);
  console.log(`TELEGRAM_BOT=${process.env.TELEGRAM_BOT}`);
  console.log(`TELEGRAM_ENABLED=${process.env.TELEGRAM_ENABLED}`);

  app.listen(PORT, HOST);
  const startMessage = `Valheim Server Status running on http://${HOST}:${PORT}`;
  console.log(startMessage);
  sendTelegramMessage(startMessage);
  queryServer();
}

if (require.main === module) {
  main();
}
