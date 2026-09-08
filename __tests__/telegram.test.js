jest.mock("axios");
const axios = require("axios");

process.env.TELEGRAM_ENABLED = "true";
process.env.TELEGRAM_CHAT_ID = "12345";
process.env.TELEGRAM_BOT = "botFAKE:FAKE";

const telegram = require("../telegram");

describe("Telegram Module", () => {
  test("sendTelegramMessage should be defined", () => {
    expect(telegram.sendTelegramMessage).toBeDefined();
  });

  test("sendTelegramMessage should call axios.post when enabled", async () => {
    axios.post.mockResolvedValue({ status: 200 });
    telegram.sendTelegramMessage("Test message");
    await new Promise((resolve) => setImmediate(resolve));
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining(process.env.TELEGRAM_BOT),
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: "Test message",
        disable_notification: true,
      }
    );
  });
});
