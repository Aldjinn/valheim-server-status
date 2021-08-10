const gamedig = require("gamedig");
const prometheus = require("prom-client");
const telegram = require("./telegram.js");

const playerCount = new prometheus.Gauge({
  name: "player_count",
  help: "number of players",
  labelNames: ["player_count"],
});

const serverInfo = new prometheus.Gauge({
  name: "server_info",
  help: "server info",
  labelNames: ["version", "name", "map"],
});

let gamedigResult = "No query yet.";
let currentNumberOfPlayers = -1;

module.exports = {
  getGamedigResult: function () {
    return gamedigResult;
  },

  queryServer: function () {
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
        json.queryDate = new Date().toISOString();
        json.numberOfPlayers = state.players.length;
        gamedigResult = json;

        console.log(gamedigResult);
        this.adjustMetrics(gamedigResult);
        this.checkPlayerLeftOrJoined(gamedigResult);
        return gamedigResult;
      })
      .catch((error) => {
        console.log("Server is offline: " + error);
      });
  },

  adjustMetrics: function (gamedigResult) {
    if (process.env.METRICS_ENABLED === "true") {
      playerCount.set(gamedigResult.players.length);
      serverInfo.set(
        {
          version: gamedigResult.raw.tags,
          name: gamedigResult.name,
          map: gamedigResult.map,
        },
        1
      );
    }
  },

  checkPlayerLeftOrJoined: function (gamedigResult) {
    console.log(
      "there are currently " +
        gamedigResult.players.length +
        " players on the server"
    );

    if (currentNumberOfPlayers < 0) {
      currentNumberOfPlayers = gamedigResult.players.length;
    } else {
      if (currentNumberOfPlayers != gamedigResult.players.length) {
        const change =
          "(" +
          currentNumberOfPlayers +
          "->" +
          gamedigResult.players.length +
          ")";

        console.log("number of players " + change);

        if (currentNumberOfPlayers < gamedigResult.players.length) {
          telegram.sendTelegramMessage(
            "Player joined. " + change
          );
        } else {
          telegram.sendTelegramMessage(
            "Player left. " + change
          );
        }
      }
      currentNumberOfPlayers = gamedigResult.players.length;
    }
  },
};
