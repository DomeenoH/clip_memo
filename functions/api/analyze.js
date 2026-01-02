
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const content = body.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No content provided" }), { status: 400 });
    }

    // Using Qwen 1.5 7B Chat - a great balance of speed and instruction following
    // Note: You must enable Workers AI in your Cloudflare Dashboard for this project
    const model = "@cf/qwen/qwen1.5-7b-chat-awq";

    const systemPrompt = `You are a helper for a personal diary app. Your job is to analyze the user's input and extract structured metadata in JSON format.
    
    Output JSON ONLY. No markdown code blocks. No introductory text.
    
    The JSON structure must be:
    {
      "tags": ["string", "string"], // 1-3 short Chinese tags (e.g., "代码", "灵感", "生活", "工作")
      "isTodo": boolean, // True if it implies a task
      "isResource": boolean, // True if it mentions a book, movie, link, or tool to check later
      "resourceType": "read" | "watch" | "listen" | "code" | null // If isResource is true, categorize it.
    }
    `;

    const response = await env.AI.run(model, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content }
      ],
    });

    // Parse the raw response to ensure it's valid JSON, or attempt to clean it
    let resultText = response.response;
    
    // Attempt to extract JSON if the model added markdown blocks
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      resultText = jsonMatch[0];
    }

    return new Response(resultText, {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, tags: [], isTodo: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}