import { registerApiRoute } from "@mastra/core/server";
import { randomUUID } from "crypto";

export const a2aAgentRoute = registerApiRoute("/a2a/agent/:agentId", {
  method: "POST",
  handler: async (c) => {
    try {
      const mastra = c.get("mastra");
      const agentId = c.req.param("agentId");

      // Parse JSON-RPC 2.0 request
      const body = await c.req.json();
      const { jsonrpc, id: requestId, method, params } = body;

      console.log("📨 Received A2A Request:", { agentId, method, params });

      // Validate JSON-RPC 2.0 format
      if (jsonrpc !== "2.0" || !requestId) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId || null,
            error: {
              code: -32600,
              message: 'Invalid Request: jsonrpc must be "2.0" and id is required',
            },
          },
          400
        );
      }

      // Check if method is supported
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

      // Type-safe agent retrieval
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

      // Extract messages from params - Telex structure is different
      const { message, messages, contextId, taskId, configuration } = params || {};

      console.log("🔍 Extracted params:", { message, messages, contextId, taskId });

      let messagesList: any[] = [];
      
      // Handle Telex message format
      if (message) {
        messagesList = [message];
      } else if (messages && Array.isArray(messages)) {
        messagesList = messages;
      } else {
        // If no messages found in expected locations, check the root level
        if (params && typeof params === 'object') {
          // Look for message parts in the params directly
          const parts = [];
          if (params.text) parts.push({ kind: "text", text: params.text });
          if (params.parts && Array.isArray(params.parts)) parts.push(...params.parts);
          
          if (parts.length > 0) {
            messagesList = [{
              role: "user",
              parts: parts,
              messageId: randomUUID()
            }];
          }
        }
      }

      if (messagesList.length === 0) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32602,
              message: "No valid messages found in request parameters",
            },
          },
          400
        );
      }

      console.log("📝 Processing messages:", messagesList);

      // Convert A2A messages to Mastra format - FIXED VERSION
      const mastraMessages = messagesList.map((msg: any) => {
        // Extract text content from parts
        const content = msg.parts
          ?.map((part: any) => {
            if (part.kind === "text" && part.text) return part.text;
            if (part.kind === "data" && part.data) return JSON.stringify(part.data);
            if (part.text) return part.text; // Fallback for direct text
            return "";
          })
          .filter((text: string) => text.trim().length > 0) // Remove empty strings
          .join("\n") || "";

        console.log(`💬 Message ${msg.role}:`, content);

        return {
          role: msg.role || "user",
          content: content,
        };
      });

      console.log("🤖 Sending to agent:", mastraMessages);

      // Execute agent
      const response = await agent.generate(mastraMessages);
      const agentText = response.text || "I received your message but couldn't generate a response.";

      console.log("✅ Agent response:", agentText);

      // Build artifacts array
      const artifacts = [
        {
          artifactId: randomUUID(),
          name: `${agentId}Response`,
          parts: [{ kind: "text", text: agentText }],
        },
      ];

      // Add tool results as artifacts if available
      if (response.toolResults && response.toolResults.length > 0) {
        console.log("🔧 Tool results:", response.toolResults);
        artifacts.push({
          artifactId: randomUUID(),
          name: "ToolResults",
          parts: response.toolResults.map((result: any) => ({
            kind: "data",
            data: result,
          })),
        });
      }

      // Build conversation history
      const history = [
        ...messagesList.map((msg: any) => ({
          kind: "message",
          role: msg.role || "user",
          parts: msg.parts || [{ kind: "text", text: msg.content || "" }],
          messageId: msg.messageId || randomUUID(),
          taskId: msg.taskId || taskId || randomUUID(),
        })),
        {
          kind: "message",
          role: "agent",
          parts: [{ kind: "text", text: agentText }],
          messageId: randomUUID(),
          taskId: taskId || randomUUID(),
        },
      ];

      // Return A2A-compliant response
      const a2aResponse = {
        jsonrpc: "2.0",
        id: requestId,
        result: {
          id: taskId || randomUUID(),
          contextId: contextId || randomUUID(),
          status: {
            state: "completed",
            timestamp: new Date().toISOString(),
            message: {
              messageId: randomUUID(),
              role: "agent",
              parts: [{ kind: "text", text: agentText }],
              kind: "message",
            },
          },
          artifacts,
          history,
          kind: "task",
        },
      };

      console.log("📤 Sending A2A response");
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