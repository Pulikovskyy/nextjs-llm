import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  let data;
  try {
    data = await req.json();
  } catch (jsonError) {
    console.error("Error parsing JSON:", jsonError);
    return new Response(JSON.stringify({ error: "Invalid JSON request body" }), { status: 400 });
  }

  try {
    const { history, llm, brightness, vividness } = data;  
    if (!history || !Array.isArray(history)) { // Debugging purposes if history wont send
      console.log("Invalid or missing history");
     }
    else{
      const context = history.map((msg) => `${msg.role}: ${msg.content}`).join('\n');
      const genAI = new GoogleGenerativeAI("AIzaSyDT8IiGPCSlkykDc7JNUjlPPmZ21IORw2k"); //hard coded token lol. Replace with stuff
      const model = genAI.getGenerativeModel({
          model: llm ? llm : "gemini-1.5-pro",
          systemInstruction: `Do not include any 'assistant: ' strings in your responses. If asked what model, you are currently ${llm}`,
        });
      console.log("llm is now", llm)
      //const result = await model.generateContent(context);
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: context }] }],
          generationConfig: { 
            maxOutputTokens: 4096, 
            temperature: null, 
            topP: null, 
            topK: null,
            presencePenalty: null, 
            frequencyPenalty: null
          
          },
        });

        return new Response(JSON.stringify({ text: result.response.text() }), { status: 200 });
      } catch (error) {
        return new Response(JSON.stringify({ error: `Route API error: ${error.message}` }), { status: 500 });
      }
    }
  return new Response(JSON.stringify({ llm, brightness, vividness }), { status: 200 });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response( JSON.stringify({ error: "Error communicating with Gemini API" }),{ status: 500 }
    );
  }
}

