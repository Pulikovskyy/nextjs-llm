import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "yxeigAPSSdn4ppsKZ2OxplNqF8rXqEijj8bcZ0gL",
  baseURL: `https://api.cloudflare.com/client/v4/accounts/6be8bb8c9a7803c841e08c30d1e8a9dd/ai/v1`,
});

export async function POST(req) {
    try {
        const data = await req.json();
        console.log(data)
        const { history, llm, topK, topP, temperature } = data;
        const context = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');
        const effectiveTopK = typeof topK === 'number' ? Math.max(1, Math.min(topK, 100)) : 25; // Range 1-50
        const effectiveTopP = typeof topP === 'number' ? Math.max(0, Math.min(topP, 1)) : 1;  // Range 0-2
        const effectiveTemperature = typeof temperature === 'number' ? Math.max(0, temperature) : 0.6;  // Range 0-5


        const completion = await openai.chat.completions.create({
            model: llm ? llm : "@hf/mistral/mistral-7b-instruct-v0.2",
            messages: [
                { role: "system", content: `Do not include any 'assistant: ' strings in your responses. If asked what model, you are currently ${llm} and state your parameters. These are topK, topP, and temperature respectively with the values: ${effectiveTopK}, ${effectiveTopP}, ${effectiveTemperature}` },
                { role: "user", content: context },
            ],
            topP: effectiveTopP,
            topK: effectiveTopK,
            temperature: effectiveTemperature
        });

        const aiResponse = completion.choices[0].message.content;
        return new Response(JSON.stringify({ result: { response: aiResponse } }), {status: 200});
    } catch (error) {
        console.error("Error:", error.message);
        return new Response( JSON.stringify({ error: "Error communicating with OpenAI API" }),{ status: 500 });
    }
}

