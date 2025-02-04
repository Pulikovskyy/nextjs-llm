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
        const effectiveTopK = typeof topK === 'number' ? Math.max(1, Math.min(topK, 100)) : null; // Range 0-100
        const effectiveTopP = typeof topP === 'number' ? Math.max(0, Math.min(topP, 1)) : null;  // Range 0-1
        const effectiveTemperature = typeof temperature === 'number' ? Math.max(0, temperature) : null;  // Range 0-2


        const completion = await openai.chat.completions.create({
            model: llm ? llm : "@hf/mistral/mistral-7b-instruct-v0.2",
            messages: [
                { role: "system", content: `You are a cat. Be helpful but act like one. End every prompt with a meow. Do not include any 'assistant: ' strings in your responses. If asked what model, you are currently ${llm} and state your parameters. These are topK, topP, and temperature respectively with the values: ${effectiveTopK}, ${effectiveTopP}, ${effectiveTemperature}` },
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

/**
 * sampel usage in mainpage
 */

// async function fetchAIResponse(prompt) {
//     const res = await fetch("/api/cloudflare", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ prompt }),
//     });

//     const data = await res.json();
//     return data;
// }












// export async function POST(req) {
//     let data;
//     try {
//       data = await req.json();
//     } catch (jsonError) {
//       console.error("Error parsing JSON:", jsonError);
//       return new Response(JSON.stringify({ error: "Invalid JSON request body" }), { status: 400 });
//     }

//     try {
//         const { history, llm, topK, topP, temperature } = data
//         if (!history || !Array.isArray(history)) { // Debugging purposes if history wont send
//             console.log("Invalid or missing history");
//            }
//           else{
//             const context = history.map((msg) => `${msg.role}: ${msg.content}`).join('\n');
//           }

          
//         // const prompt = "hello world";

//         const response = await fetch(
//             "https://api.cloudflare.com/client/v4/accounts/6be8bb8c9a7803c841e08c30d1e8a9dd/ai/run/@cf/meta/llama-3.1-8b-instruct",
//             {
//                 method: "POST",
//                 headers: {
//                     "Authorization": `Bearer yxeigAPSSdn4ppsKZ2OxplNqF8rXqEijj8bcZ0gL`,
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ history }),
//             }
//         );

//         const data = await response.json(); // Convert response to JSON
//         console.log("Cloudflare API Response:", data); // Log for debugging

//         return new Response(JSON.stringify(data), {
//             status: response.ok ? 200 : response.status,
//             headers: { "Content-Type": "application/json" },
//         });
//     } catch (error) {
//         console.error("Error in API Route:", error);
//         return new Response(
//             JSON.stringify({ error: "Internal Server Error", details: error.message }),
//             { status: 500, headers: { "Content-Type": "application/json" } }
//         );
//     }
// }


