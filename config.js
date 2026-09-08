"use strict";

// Central configuration: parsed once from environment variables.
// Boolean flags use the string "true" to stay backward compatible with
// existing compose/env setups.

const config = {
  valheim: {
    host: process.env.VALHEIM_HOST,
    port: process.env.VALHEIM_PORT,
    queryCron: process.env.VALHEIM_QUERY_CRON,
  },
  telegram: {
    enabled: process.env.TELEGRAM_ENABLED === "true",
    startupMessage: process.env.TELEGRAM_STARTUP_MESSAGE === "true",
    chatId: process.env.TELEGRAM_CHAT_ID,
    bot: process.env.TELEGRAM_BOT,
  },
  metrics: {
    enabled: process.env.METRICS_ENABLED === "true",
  },
  webhook: {
    enabled: process.env.WEBHOOK_ENABLED === "true",
  },
  cors: {
    enabled: process.env.CORS_ENABLED === "true",
    allowOrigin: process.env.CORS_ALLOW_ORIGIN,
  },
  isTest: process.env.NODE_ENV === "test",
};

module.exports = config;
