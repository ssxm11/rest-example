import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  redact: {
    paths: [
      "password",
      "*.password",
      "body.password",
      "token",
      "*.token",
      "req.headers.authorization",
      "req.headers.cookie",
      "*.authorization",
    ],
    censor: "[REDACTED]",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: { app: "rest-example-backend" },
});
