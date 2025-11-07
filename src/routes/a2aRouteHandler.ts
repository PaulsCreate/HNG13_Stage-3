import { registerApiRoute } from "@mastra/core/server";
import { randomUUID } from "crypto";

export const a2aAgentRoute = registerApiRoute("/a2a/agent/:agentId", {
  method: "POST",
  handler: async (c) => {
    try {
      const body = await c.req.json();
      const { jsonrpc, id: requestId, method, params } = body;
      const agentId = c.req.param("agentId");

      console.log("🔍 INCOMING REQUEST:", {
        agentId,
        method,
        hasParams: !!params,
        paramsKeys: params ? Object.keys(params) : "none",
      });

      // Validate JSON-RPC
      if (jsonrpc !== "2.0" || !requestId) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId || null,
            error: { code: -32600, message: "Invalid Request" },
          },
          400
        );
      }

      // Get the actual user message
      let userMessage = "Hello, I need study help";

      if (params?.message?.parts) {
        const textParts = params.message.parts
          .filter((part: any) => part.kind === "text" && part.text)
          .map((part: any) => part.text);
        userMessage = textParts.join(" ") || userMessage;
      }

      console.log("💬 USER MESSAGE:", userMessage);

      // SIMPLE RESPONSE - Remove complex agent logic for now
      const agentResponse = `I'm StudySync! I received your message: "${userMessage}". I can help you create study schedules, track progress, and suggest study techniques. What would you like to work on?`;

      // Return proper A2A format
      const response = {
        jsonrpc: "2.0",
        id: requestId,
        result: {
          id: randomUUID(),
          contextId: randomUUID(),
          status: {
            state: "completed",
            timestamp: new Date().toISOString(),
            message: {
              messageId: randomUUID(),
              role: "agent",
              parts: [{ kind: "text", text: agentResponse }],
              kind: "message",
            },
          },
          artifacts: [
            {
              artifactId: randomUUID(),
              name: "studySyncResponse",
              parts: [{ kind: "text", text: agentResponse }],
            },
          ],
          history: [
            {
              kind: "message",
              role: "user",
              parts: [{ kind: "text", text: userMessage }],
              messageId: randomUUID(),
              taskId: randomUUID(),
            },
            {
              kind: "message",
              role: "agent",
              parts: [{ kind: "text", text: agentResponse }],
              messageId: randomUUID(),
              taskId: randomUUID(),
            },
          ],
          kind: "task",
        },
      };

      console.log("📤 SENDING RESPONSE");
      return c.json(response);
    } catch (error: any) {
      console.error("❌ A2A ERROR:", error);
      return c.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32603,
            message: "Internal error",
            data: { details: error.message },
          },
        },
        500
      );
    }
  },
});

export const healthRoute = registerApiRoute("/a2a/health", {
  method: "GET",
  handler: async (c) => {
    return c.json({
      status: "healthy",
      service: "StudySync Agent",
      timestamp: new Date().toISOString(),
      endpoint:
        "https://study-agent-hng13.mastra.cloud/a2a/agent/studySyncAgent",
    });
  },
});
