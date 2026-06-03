import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Dynamic slab suggestions endpoint using Gemini

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { currentCars, currentSlabs, salesVolume, targetPayout } = body;

    // Build query
    const prompt = `You are a sales incentive consultant for Nippon Toyota. Based on the following data, suggest 5 optimal slab configurations:

Current Car Models: ${currentCars && currentCars.length > 0 ? currentCars.map((c: any) => c.modelName).join(", ") : "Multiple models"}
Current Slabs: ${JSON.stringify(currentSlabs)}
Average Sales Volume: ${salesVolume} units/month
Target Total Monthly Payout: ₹${targetPayout}

For each suggestion:
1. Provide a description of the strategy
2. List the exact slab configuration (minUnits, maxUnits, incentivePerUnit)
3. Explain the rationale

Format the response as JSON with array of suggestions. Keep it professional and concise.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let suggestions;
    try {
      suggestions = JSON.parse(responseText);
    } catch {
      suggestions = responseText;
    }

    return NextResponse.json({
      success: true,
      suggestions,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Gemini API error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to generate suggestions",
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}
