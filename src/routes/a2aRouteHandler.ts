import { registerApiRoute } from "@mastra/core/server";
import { randomUUID } from "crypto";

export const a2aAgentRoute = registerApiRoute("/a2a/agent/:agentId", {
  method: "POST",
  handler: async (c) => {
    console.log("🚀 A2A ENDPOINT HIT - StudySync Agent");

    try {
      const mastra = c.get("mastra");
      const agentId = c.req.param("agentId");

      // Parse JSON-RPC 2.0 request
      const body = await c.req.json();
      const { jsonrpc, id: requestId, method, params } = body;

      console.log("📨 Received A2A Request:", {
        agentId,
        method,
        requestId,
      });

      // Validate JSON-RPC 2.0 format
      if (jsonrpc !== "2.0" || !requestId) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId || null,
            error: {
              code: -32600,
              message:
                'Invalid Request: jsonrpc must be "2.0" and id is required',
            },
          },
          400
        );
      }

      if (method !== "message/send") {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32601,
              message: `Method not supported: ${method}. Only 'message/send' is supported.`,
            },
          },
          400
        );
      }

      if (agentId !== "studySyncAgent") {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32602,
              message: `Agent '${agentId}' not found. Available agent: studySyncAgent`,
            },
          },
          404
        );
      }

      const agent = mastra.getAgent(agentId as "studySyncAgent");

      // Extract message data (simplified for now)
      const userMessage = params?.message?.parts?.[0]?.text || "Hello";
      const contextId = params?.message?.taskId || randomUUID();
      const taskId = params?.message?.messageId || randomUUID();

      console.log("💬 User message:", userMessage);
      console.log("🔑 Context ID:", contextId, "Task ID:", taskId);

      // Execute agent with tools
      console.log("🤖 Processing with StudySync agent...");
      const response = await agent.run(
        [{ role: "user", content: userMessage }],
        {
          tools: [
            "studySessionTool",
            "studyScheduleTool",
            "progressAssessmentTool",
          ],
          enableToolUsage: true,
        }
      );

      console.log("🔧 Full agent response:", JSON.stringify(response, null, 2));

      // Extract response text and tool results
      const agentText = response.text || "I'm here to help with your studies!";
      const toolResults = response.toolResults || [];

      console.log("✅ Agent text:", agentText);
      console.log("🛠️ Tool results:", toolResults.length);

      // Build the EXACT response format Telex expects
      const messageId = randomUUID();

      // Main response message
      const responseMessage = {
        kind: "message",
        role: "agent",
        parts: [
          {
            kind: "text",
            text: agentText,
          },
        ],
        messageId: messageId,
        taskId: taskId,
      };

      // Build artifacts array (CRITICAL - Telex expects this)
      const artifacts = [
        {
          artifactId: randomUUID(),
          name: `${agentId}Response`,
          parts: [
            {
              kind: "text",
              text: agentText,
            },
          ],
        },
      ];

      // Add tool results as separate artifacts (like the weather example)
      if (toolResults.length > 0) {
        artifacts.push({
          artifactId: randomUUID(),
          name: "ToolResults",
          parts: toolResults.map((result: any) => ({
            kind: "data",
            data: result,
          })),
        });
      }

      // Build history (optional but recommended)
      const history = [
        {
          kind: "message",
          role: "user",
          parts: [
            {
              kind: "text",
              text: userMessage,
            },
          ],
          messageId: randomUUID(),
          taskId: taskId,
        },
        responseMessage,
      ];

      // Final A2A-compliant response
      const a2aResponse = {
        jsonrpc: "2.0",
        id: requestId,
        result: {
          id: taskId,
          contextId: contextId,
          status: {
            state: "completed",
            timestamp: new Date().toISOString(),
            message: responseMessage,
          },
          artifacts: artifacts, // This is crucial!
          history: history,
          kind: "task",
        },
      };

      console.log("📤 Sending A2A response with artifacts:", artifacts.length);
      return c.json(a2aResponse);
    } catch (error: any) {
      console.error("❌ A2A Route Error:", error);
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
