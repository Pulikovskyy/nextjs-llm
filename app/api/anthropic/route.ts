// app/api/anthropic/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
export const maxDuration = 60; 


// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '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'
});

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    console.log("Received body:", JSON.stringify(body, null, 2)); // Debug log
    
    const { llm, message, conversationHistory = [], temperature, maxTokens } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Define the model to use
    const effectiveModel = llm || "claude-3-7-sonnet-20250219";
    const effectiveTemperature = temperature || 0.7;
    const effectiveMaxTokens = maxTokens || 8192;

    // Create system prompt that includes model information
    const systemPrompt = `You are running as ${effectiveModel} with temperature=${effectiveTemperature} and max_tokens=${effectiveMaxTokens}. If asked about your model or configuration, include this information in your response.`;

    // Ensure message format is correct for Anthropic API
    // Each message must have 'role' (either 'user' or 'assistant') and 'content'
    const formattedMessages = conversationHistory
      .filter((msg: { role: string; content: any; }) => msg && typeof msg === 'object' && 
              (msg.role === 'user' || msg.role === 'assistant') && 
              typeof msg.content === 'string')
      .map((msg: { role: any; content: any; }) => ({
        role: msg.role,
        content: msg.content
      }));
    
    // Add the current user message
    const messages = [
      ...formattedMessages,
      { role: "user", content: message }
    ];

    console.log("Formatted messages:", JSON.stringify(messages, null, 2)); // Debug log
    console.log("System prompt:", systemPrompt); // Debug log

    // Call Claude API with system as a top-level parameter
    const response = await anthropic.messages.create({
      model: effectiveModel,
      max_tokens: effectiveMaxTokens,
      temperature: effectiveTemperature,
      system: systemPrompt,
      messages: messages,
    });

    // Extract text from the response content
    // Handle different content block types
    let assistantResponse = "";
    for (const block of response.content) {
      if (block.type === 'text') {
        assistantResponse += block.text;
      }
      // You can handle other content types here if needed
    }

    // Add Claude's response to conversation history
    const updatedHistory = [
      ...messages,
      { role: "assistant", content: assistantResponse }
    ];

    // Return response with updated conversation history
    return NextResponse.json({
      response: assistantResponse,
      conversationHistory: updatedHistory,
      modelUsed: effectiveModel
    });
    
  } catch (error: any) {
    console.error('Error processing request:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('API Response Error:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process request', 
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
