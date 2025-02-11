import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "yxeigAPSSdn4ppsKZ2OxplNqF8rXqEijj8bcZ0gL",
  baseURL: "https://api.cloudflare.com/client/v4/accounts/6be8bb8c9a7803c841e08c30d1e8a9dd/ai/v1",
});

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("Received data:", JSON.stringify(data));

    // Top_P and Top_K not supported by the cloudflare API. Probably
    const { history, llm, topK, topP, temperature, prompt, maxTokens } = data;

    const params = {
      model: llm || "@hf/mistral/mistral-7b-instruct-v0.2",
      messages: [
        { role: "system", content: prompt ? prompt : "You are a cat named neko" },
        ...history,
      ],
    };

    // Log the parameters being sent to the API
    console.log("Parameters being sent to OpenAI:", JSON.stringify(params, null, 2));

    // Conditionally add optional parameters to the request
    if (temperature !== undefined && temperature !== null) {
      params.temperature = parseFloat(temperature);
    }

    if (maxTokens !== undefined && maxTokens !== null) {
      params.max_tokens = parseInt(maxTokens, 10);
    }

    // Log the parameters with optional ones included
    console.log("Final API parameters:", JSON.stringify(params, null, 2));

    // Make the API request
    const response = await openai.chat.completions.create(params);

    // Log the full response for debugging
    console.log("API Response:", JSON.stringify(response, null, 2));

    const aiResponse = response.choices[0].message.content;

    return new Response(JSON.stringify({ result: { response: aiResponse } }), { status: 200 });

  } catch (error) {
    // Log detailed error information
    console.error("Error:", error);
    
    // If the error contains response details, log them
    if (error.response) {
      console.error("Error response details:", JSON.stringify(error.response, null, 2));
    }

    return new Response(
      JSON.stringify({ error: "Error communicating with Cloudflare API through OpenAI chatcompletions", details: error.message }),
      { status: 500 }
    );
  }
}
