// app/api/openai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

// Initialize OpenAI client with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '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', // Replace with your API key or use environment variable
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("Received data:", JSON.stringify(data));

    // Extract parameters from request
    const { llm, messages, temperature, maxTokens, topP, prompt } = data;

    // Configure the model parameters
    const effectiveModel = llm || "gpt-4o";
    const effectiveTemperature = temperature !== undefined ? parseFloat(temperature) : 0.7;
    const effectiveMaxTokens = maxTokens !== undefined ? parseInt(maxTokens, 10) : 1024;
    const effectiveTopP = topP !== undefined ? parseFloat(topP) : 1.0;
    
    // Create a default system message that includes model information if no custom prompt is provided
    const systemMessage = prompt || 
      `You are running as ${effectiveModel} with temperature=${effectiveTemperature}, max_tokens=${effectiveMaxTokens}, and top_p=${effectiveTopP}. If asked about your model or configuration, include this information in your response.`;
    
    // Prepare the messages array with the system message at the beginning
    const formattedMessages = [
      { role: "system", content: systemMessage }
    ];
    
    // Add the user and assistant messages from the conversation history
    messages.forEach((msg: any) => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        formattedMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });

    const params: any = {
      model: effectiveModel,
      messages: formattedMessages,
      temperature: effectiveTemperature,
      max_tokens: effectiveMaxTokens,
      top_p: effectiveTopP
    };

    // Log the parameters being sent to OpenAI
    console.log("Parameters being sent to OpenAI:", JSON.stringify(params, null, 2));

    // Make the API request to OpenAI
    const response = await openai.chat.completions.create(params);

    // Log the full response for debugging
    console.log("API Response:", JSON.stringify(response, null, 2));

    // Extract the assistant's message
    const assistantMessage = response.choices[0].message.content;

    // Return the response
    return NextResponse.json({
      message: assistantMessage,
      model: effectiveModel,
      usage: response.usage
    });

  } catch (error: any) {
    // Log detailed error information
    console.error("Error:", error);
    
    // If the error contains response details, log them
    if (error.response) {
      console.error("Error response details:", JSON.stringify(error.response, null, 2));
    }

    return NextResponse.json(
      { 
        error: "Error communicating with OpenAI API", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';