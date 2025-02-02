import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { history } = await req.json();

    if (!history || !Array.isArray(history)) { // Debugging purposes if history wont send
      throw new Error("Invalid or missing history");
    }

    // history into a single prompt string
    const prompt = history.map((msg) => `${msg.role}: ${msg.content}`).join('\n');
    const genAI = new GoogleGenerativeAI("AIzaSyDT8IiGPCSlkykDc7JNUjlPPmZ21IORw2k"); //hard coded token lol
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: "",
      });

    //const result = await model.generateContent(prompt);

    const result = await model.generateContent({
        contents: [
            {
              role: 'user',
              parts: [
                {
                  text: prompt,
                }
              ],
            }
        ],
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: null,
          topP: null,
          topK: null,

        }
    });

    return new Response(JSON.stringify({ text: result.response.text() }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: "Error communicating with Gemini API" }),
      { status: 500 }
    );
  }
}
