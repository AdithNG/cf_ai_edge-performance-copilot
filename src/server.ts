import { routeAgentRequest, type Schedule } from "agents";

// import { getSchedulePrompt } from "agents/schedule";

import { AIChatAgent } from "agents/ai-chat-agent";
import {
  generateId,
  streamText,
  type StreamTextOnFinishCallback,
  stepCountIs,
  createUIMessageStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
  type ToolSet
} from "ai";

import { createWorkersAI } from "workers-ai-provider";

import { processToolCalls, cleanupMessages } from "./utils";
import { tools, executions } from "./tools";

type AllTools = typeof tools & ReturnType<AIChatAgent<Env>["mcp"]["getAITools"]>;

/**
 * Chat Agent implementation that handles real time AI chat interactions
 */
export class Chat extends AIChatAgent<Env> {
  /**
   * Handles incoming chat messages and manages the response stream
   */
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    _options?: { abortSignal?: AbortSignal }
  ) {
    const allTools: AllTools = {
      ...tools,
      ...this.mcp.getAITools()
    };

    const workersai = createWorkersAI({ binding: this.env.AI });

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const cleanedMessages = cleanupMessages(this.messages);

        const processedMessages = await processToolCalls({
          messages: cleanedMessages,
          dataStream: writer,
          tools: allTools,
          executions
        });

        const result = streamText({
          system: `
You are Edge Performance Copilot, an assistant that helps developers
debug and improve applications running on Cloudflare.

Goals:
- Explain performance issues in clear, practical language.
- Suggest concrete improvements using Cloudflare products such as
  Workers, Pages, KV, Durable Objects, Workers AI and caching.
- When helpful, generate example code snippets for Workers or Wrangler config.
- If you are missing key details, ask focused follow up questions.

Input formats:
- Natural language questions like "Why is my TTFB high on this route?"
- Optional JSON describing metrics, for example:
  { "route": "/api/data", "ttfb_ms": 800, "cacheHitRate": 0.2 }

Response format:
1) Short summary of what you think is happening.
2) Numbered list of recommendations, most impactful first.
3) Optional "Example" section with small code or config snippets.

Always assume the app is running on Cloudflare's edge and prefer solutions
that use Cloudflare features instead of generic cloud advice.
`,
          messages: convertToModelMessages(processedMessages),
          model: workersai("@cf/meta/llama-3.1-8b-instruct"),
          tools: allTools,
          onFinish: onFinish as unknown as StreamTextOnFinishCallback<AllTools>,
          stopWhen: stepCountIs(10)
        });

        writer.merge(result.toUIMessageStream());
      }
    });

    return createUIMessageStreamResponse({ stream });
  }

  async executeTask(description: string, _task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        parts: [
          {
            type: "text",
            text: `Running scheduled task: ${description}`
          }
        ],
        metadata: {
          createdAt: new Date()
        }
      }
    ]);
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Frontend calls this to decide whether to show the red warning banner.
    // We always return success since we are using Workers AI, not OpenAI.
    if (url.pathname === "/check-open-ai-key") {
      return Response.json({
        success: true
      });
    }

    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;