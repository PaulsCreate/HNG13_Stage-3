// src/mastra/index.ts
import "dotenv/config";
import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { studySyncAgent } from "./agents/studySyncAgent.js";
export const mastra = new Mastra({
    agents: {
        studySyncAgent, // ✅ Remove the nested 'agent' property
    },
    storage: new LibSQLStore({
        url: "file:./studysync-storage.db",
    }),
});
//# sourceMappingURL=index.js.map