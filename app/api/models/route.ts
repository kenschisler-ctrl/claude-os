import Anthropic from "@anthropic-ai/sdk";

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });
  try {
    const response = await client.models.list();
    return Response.json({ models: response.data });
  } catch {
    return Response.json({
      models: [
        { id: "claude-opus-4-7", display_name: "Claude Opus 4.7" },
        { id: "claude-sonnet-4-6", display_name: "Claude Sonnet 4.6" },
        { id: "claude-haiku-4-5-20251001", display_name: "Claude Haiku 4.5" },
      ],
    });
  }
}
