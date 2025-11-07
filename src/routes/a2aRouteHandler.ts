import { registerApiRoute } from '@mastra/core/server';
import { randomUUID } from 'crypto';

export const a2aAgentRoute = registerApiRoute('/a2a/agent/:agentId', {
  method: 'POST',
  handler: async (c) => {
    try {
      const mastra = c.get('mastra');
      const agentId = c.req.param('agentId');

      // Parse JSON-RPC 2.0 request
      const body = await c.req.json();
      const { jsonrpc, id: requestId, method, params } = body;

      console.log("📨 Received A2A Request:", { agentId, method, requestId });

      // Validate JSON-RPC 2.0 format
      if (jsonrpc !== '2.0' || !requestId) {
        return c.json({
          jsonrpc: '2.0',
          id: requestId || null,
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc must be "2.0" and id is required'
          }
        }, 400);
      }

      // Check if method is supported
      if (method !== "message/send") {
        return c.json({
          jsonrpc: "2.0",
          id: requestId,
          error: {
            code: -32601,
            message: `Method not supported: ${method}. Only 'message/send' is supported.`
          }
        }, 400);
      }

      const agent = mastra.getAgent(agentId);
      if (!agent) {
        return c.json({
          jsonrpc: '2.0',
          id: requestId,
          error: {
            code: -32602,
            message: `Agent '${agentId}' not found`
          }
        }, 404);
      }

      // Extract messages from params (following your template)
      const { message, messages, contextId, taskId, metadata } = params || {};

      let messagesList = [];
      if (message) {
        messagesList = [message];
      } else if (messages && Array.isArray(messages)) {
        messagesList = messages;
      }

      console.log("📝 Processing messages:", messagesList.length);

      // Convert A2A messages to Mastra format (following your template)
      const mastraMessages = messagesList.map((msg) => ({
        role: msg.role,
        content: msg.parts?.map((part) => {
          if (part.kind === 'text') return part.text;
          if (part.kind === 'data') return JSON.stringify(part.data);
          return '';
        }).join('\n') || ''
      }));

      console.log("🤖 Sending to agent:", mastraMessages);

      // Execute agent (following your template)
      const response = await agent.generate(mastraMessages);
      const agentText = response.text || 'Hello! I\'m StudySync, your AI study partner. How can I help you with your studies today?';

      console.log("✅ Agent response:", agentText);

      // Build artifacts array (following your template)
      const artifacts = [
        {
          artifactId: randomUUID(),
          name: `${agentId}Response`,
          parts: [{ kind: 'text', text: agentText }]
        }
      ];

      // Add tool results as artifacts (following your template)
      if (response.toolResults && response.toolResults.length > 0) {
        console.log("🔧 Tool results:", response.toolResults.length);
        artifacts.push({
          artifactId: randomUUID(),
          name: 'ToolResults',
          parts: response.toolResults.map((result) => ({
            kind: 'data',
            data: result
          }))
        });
      }

      // Build conversation history (following your template)
      const history = [
        ...messagesList.map((msg) => ({
          kind: 'message',
          role: msg.role,
          parts: msg.parts,
          messageId: msg.messageId || randomUUID(),
          taskId: msg.taskId || taskId || randomUUID(),
        })),
        {
          kind: 'message',
          role: 'agent',
          parts: [{ kind: 'text', text: agentText }],
          messageId: randomUUID(),
          taskId: taskId || randomUUID(),
        }
      ];

      // Return A2A-compliant response (following your template)
      const a2aResponse = {
        jsonrpc: '2.0',
        id: requestId,
        result: {
          id: taskId || randomUUID(),
          contextId: contextId || randomUUID(),
          status: {
            state: 'completed',
            timestamp: new Date().toISOString(),
            message: {
              messageId: randomUUID(),
              role: 'agent',
              parts: [{ kind: 'text', text: agentText }],
              kind: 'message'
            }
          },
          artifacts,
          history,
          kind: 'task'
        }
      };

      console.log("📤 Sending A2A response");
      return c.json(a2aResponse);

    } catch (error: any) {
      console.error("❌ A2A Route Error:", error);
      return c.json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Internal error',
          data: { details: error.message }
        }
      }, 500);
    }
  }
});