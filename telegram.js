const axios = require("axios");

module.exports = {
  sendTelegramMessage: function (message) {
    if (process.env.TELEGRAM_ENABLED === "true") {
      const data = {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        disable_notification: true,
      };
      console.log("sendTelegramMessage: " + message);
      axios
        .post(
          "https://api.telegram.org/" +
            process.env.TELEGRAM_BOT +
            "/sendMessage",
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
