export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, apiKey, model } = req.body || {};
  const key = apiKey || process.env.OPENAI_API_KEY;

  if (!key) {
    return res.status(400).json({ error: "Missing API key" });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Missing messages" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI error",
      });
    }

    const reply = data?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ reply: reply.trim() });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
