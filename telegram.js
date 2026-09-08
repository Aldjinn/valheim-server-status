"use strict";

const config = require("./config");
const axios = require("axios");

module.exports = {
  sendTelegramMessage: function (message) {
    if (config.telegram.enabled) {
      const data = {
        chat_id: config.telegram.chatId,
        text: message,
        disable_notification: true,
      };
      console.log("sendTelegramMessage: " + message);
      axios
        .post(
          "https://api.telegram.org/" + config.telegram.bot + "/sendMessage",
          data
        )
        .then((res) => {
          console.log(`sendTelegramMessage: ${res.status}`);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  },
};
