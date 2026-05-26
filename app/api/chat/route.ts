import Anthropic from "@anthropic-ai/sdk";
import { readConfig } from "@/lib/config.server";

export async function POST(req: Request) {
  const { messages, model = "claude-sonnet-4-6", system } = await req.json();

  const { anthropicApiKey: apiKey } = readConfig();
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "No Anthropic API key — run setup at http://localhost:3030" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = new Anthropic({ apiKey });

  const stream = await client.messages.stream({
    model,
    max_tokens: 4096,
    system: system || "You are Claude, an AI assistant. You are running inside CLAUDE OS, a mission control dashboard. Be helpful, precise, and occasionally reference the sci-fi aesthetic of the environment.",
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            );
          }
        }
        const final = await stream.finalMessage();
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              done: true,
              usage: final.usage,
              model: final.model,
            })}\n\n`
          )
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Stream error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
