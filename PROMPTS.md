# Developer Prompts Used to Build Edge Performance Copilot

This project was built with the assistance of AI. The following are examples of
high-level development prompts I asked ChatGPT during implementation.

---

## Core Development Questions

### Cloudflare Platform & Architecture

- “How do I convert the default OpenAI-based agent in the Cloudflare starter into one that runs entirely on Workers AI so I don’t need external keys?”
- “What is the simplest way to bind the Workers AI model using wrangler.jsonc, and how do I reference it inside src/server.ts?”
- “Does switching from OpenAI to Workers AI change the model calling patterns or only the provider object?”
- “What are the tradeoffs between using message history vs Durable Objects for state, and when would Cloudflare engineers use one over the other?”

### Prompt Engineering & Agent Behavior

- “How do I write a system prompt that makes the agent behave like a performance engineer and not just a generic chatbot?”
- “What constraints should I add to prevent the model from giving advice that contradicts Cloudflare best practices?”
- “How can I enforce a consistent response structure without over-constraining the model?”

---

## Developer Intent

These prompts were not used to generate answers inside the agent during runtime.  
They were used during implementation to:

- Understand Cloudflare's architecture and requirements
- Migrate the template to Workers AI
- Design a system prompt aligned with edge performance goals
- Ensure the repo structure meets expectations for a Cloudflare internship project

This file documents the development thought process and the kinds of questions I asked while building the application.
