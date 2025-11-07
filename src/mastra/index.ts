import "dotenv/config";
import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { a2aAgentRoute, healthRoute } from "../routes/a2aRouteHandler.js";
import { studySyncAgent } from "./agents/studySyncAgent.js";

// Add model configuration at the Mastra level
export const mastra = new Mastra({
  agents: {
    studySyncAgent,
  },
  storage: new LibSQLStore({
    url: "file:./studysync-storage.db",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "debug",
  }),
  observability: {
    default: { enabled: true },
  },
  server: {
    build: {
      openAPIDocs: true,
      swaggerUI: true,
    },
    apiRoutes: [a2aAgentRoute, healthRoute],
  },
  // Add model configurations here
  /*
  models: {
    "google/gemini-2.0-flash": {
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    },
  },*/
});
