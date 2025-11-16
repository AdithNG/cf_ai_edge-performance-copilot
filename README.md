# Edge Performance Copilot

This project is an AI powered chat agent that helps developers reason about
performance issues in applications running on Cloudflare.

It is built using:

- Cloudflare Agents
- Workers AI (Llama 3.x model)
- Cloudflare Workers runtime
- A streaming chat UI from the Agents starter

The agent is designed to answer questions like:

- "My Worker endpoint has 900 ms TTFB. What might be wrong and how can I fix it?"
- "When should I use KV vs Durable Objects?"
- "How can I cache JSON responses at the edge?"

## Features

- Chat interface running on Cloudflare Agents
- LLM backed responses using Workers AI
- Conversation state kept across turns inside the session
- Cloudflare focused guidance for Workers, KV, Durable Objects, and caching

## Tech stack

- Cloudflare Agents starter template
- Workers AI model `@cf/meta/llama-3.1-8b-instruct` (or similar Llama 3 model)
- TypeScript
- Vite dev server for local development

## Getting started

### Prerequisites

- Node.js and npm installed
- Cloudflare account
- Wrangler CLI (installed automatically via npm scripts)

### Install dependencies

```bash
npm install
```

## Development

Start the dev server:

```bash
npm run start
```

Then open the URL printed in the terminal, for example:

```bash
http://localhost:5173
```

You can now chat with the Edge Performance Copilot locally.

## Deployment

Log in to Cloudflare if you have not already:

```bash
npx wrangler login
```

Deploy the agent:

```bash
npm run deploy
```

## Configuration

Workers AI is bound in wrangler.jsonc using:

```bash
"ai": {
  "binding": "AI"
}
```

The agent uses this binding in src/server.ts via the workers-ai-provider adapter to call the LLM.

## How it works

The core agent logic lives in src/server.ts and extends AIChatAgent<Env>.

For each user message:

- Existing conversation messages are cleaned and processed.
- Tools are prepared (from src/tools.ts and any MCP tools).
- The messages and system prompt are sent to Workers AI via streamText.
- The streamed response is converted into UI messages for the frontend.

The system prompt turns the model into an "Edge Performance Copilot" that:

- Focuses on Cloudflare specific solutions
- Explains performance issues in plain language
- Suggests concrete steps and small code snippets

## Future improvements

Planned enhancements include:

- A simple metrics input format that lets users send TTFB and cache statistics
- Storage for historical performance reports using KV or Durable Objects
- More specialized tools for generating Worker and Wrangler config snippets
