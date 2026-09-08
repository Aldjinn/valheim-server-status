const { GameDig } = require("gamedig");
const prometheus = require("prom-client");
const telegram = require("./telegram.js");
const config = require("./config.js");

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
    GameDig.query({
      type: "valheim",
      host: config.valheim.host,
      port: config.valheim.port,
      debug: false,
      requestRules: true,
    })
      .then((state) => {
        // add querydate to result
        let json = JSON.parse(JSON.stringify(state));
        json.queryDate = new Date().toISOString();
        json.numberOfPlayers = state.players.length;
        gamedigResult = json;

        console.log(
          `query OK: ${gamedigResult.name} | players: ${gamedigResult.numberOfPlayers}`,
        );
        this.adjustMetrics(gamedigResult);
        this.checkPlayerLeftOrJoined(gamedigResult);
        return gamedigResult;
      })
      .catch((error) => {
        console.log("Server is offline: " + error);
      });
  },

  adjustMetrics: function (gamedigResult) {
    if (config.metrics.enabled) {
      playerCount.set(gamedigResult.players.length);
      serverInfo.set(
        {
          version: gamedigResult.raw.tags,
          name: gamedigResult.name,
          map: gamedigResult.map,
        },
        1,
      );
    }
  },

  checkPlayerLeftOrJoined: function (gamedigResult) {
    console.log(
      "there are currently " +
        gamedigResult.players.length +
        " players on the server",
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
          telegram.sendTelegramMessage("Player joined. " + change);
        } else {
          telegram.sendTelegramMessage("Player left. " + change);
        }
      }
      currentNumberOfPlayers = gamedigResult.players.length;
    }
  },
};
