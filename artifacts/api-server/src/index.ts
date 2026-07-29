import app from "./app";
import { logger } from "./lib/logger";

// Use Render's port if available, otherwise default to 3000 for local testing
const rawPort = process.env["PORT"] || "3000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Explicitly binding to "0.0.0.0" ensures Render can route outside traffic to it
app.listen(port, "0.0.0.0", (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});