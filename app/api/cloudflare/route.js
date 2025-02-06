import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "yxeigAPSSdn4ppsKZ2OxplNqF8rXqEijj8bcZ0gL",
  baseURL: "https://api.cloudflare.com/client/v4/accounts/6be8bb8c9a7803c841e08c30d1e8a9dd/ai/v1",
});

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("Received data:", data);

    const { history, llm, topK, topP, temperature, prompt, maxTokens } = data;

    console.log("Received", JSON.stringify(data));

    const params = {
      model: llm || "@hf/mistral/mistral-7b-instruct-v0.2",
      messages: [
        { role: "system", content: prompt ? prompt : "You are a cat named neko" },
        ...history,
      ],
    };

    // Conditionally add parameters
    if (temperature !== undefined && temperature !== null) params.temperature = parseFloat(temperature)

    if (maxTokens !== undefined && maxTokens !== null) params.max_tokens = parseInt(maxTokens, 10)

    if (topP !== undefined && topP !== null) params.top_p = parseFloat(topP); 
    
    if (topK !== undefined && topK !== null) params.top_k = parseInt(topK, 10); 

    console.log("API parameters:", params); 

    const completion = await openai.chat.completions.create(params);

    const aiResponse = completion.choices[0].message.content;
    return new Response(JSON.stringify({ result: { response: aiResponse } }), { status: 200 });

  } catch (error) {
    console.error("Error:", error); 
    return new Response(
      JSON.stringify({ error: "Error communicating with Cloudflare API through OpenAI chatcompletions" }),
      { status: 500 }
    );
  }
}