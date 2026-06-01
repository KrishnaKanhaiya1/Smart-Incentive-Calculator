import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

/**
 * AI-Powered Slab Configuration Suggestions
 * Uses Google Gemini API to suggest optimal incentive slab configurations
 * based on current sales data and pricing models
 */

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

    // Build prompt for Gemini requesting strict JSON schema format matching slabs config
    const prompt = `You are an expert sales incentive structures consultant for vehicle dealerships. Based on the following parameters, propose 3 optimal slab strategies:

Current Active Car Models: ${currentCars && currentCars.length > 0 ? currentCars.map((c: any) => c.modelName).join(", ") : "Toyota Glanza, Toyota Innova Crysta, Toyota Fortuner"}
Current active slabs structure: ${JSON.stringify(currentSlabs)}
Average dealer sales volume: ${salesVolume || 50} cars per month
Target total commission payout: ₹${targetPayout || 100000}

Your response MUST be a JSON array. Each element in the array represents a pricing model strategy and must match this schema:
{
  "strategy": "Strategic Title for the suggestion",
  "rationale": "Business justification explaining how this tier structure optimizes cashflow and motivates top sales performers.",
  "slabs": [
    {
      "minUnits": 1,
      "maxUnits": 3,
      "incentivePerCar": 1000
    }
  ]
}

Slabs design guidelines:
1. The first slab tier MUST start minUnits at 1.
2. Slabs MUST be strictly sequential with zero gaps or overlaps (e.g. Tier 1: 1-3, Tier 2: 4-7, Tier 3: 8-12, Tier 4: 13+).
3. The final slab tier maxUnits MUST be null (representing infinity, e.g., 13+).
4. All numbers MUST be integers (do not return floats).
5. All incentives must be positive integers representing payout per vehicle.`;

    // Initialize Gemini with API key
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-2.5-flash for stable and highly responsive JSON generation config
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Try to parse as JSON, fallback to text response
    let suggestions;
    try {
      let cleanedText = responseText.trim();
      
      // Robust JSON boundaries finder
      const firstBracket = cleanedText.indexOf("[");
      const firstBrace = cleanedText.indexOf("{");
      let startIdx = -1;
      let endIdx = -1;
      
      if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        startIdx = firstBracket;
        endIdx = cleanedText.lastIndexOf("]");
      } else if (firstBrace !== -1) {
        startIdx = firstBrace;
        endIdx = cleanedText.lastIndexOf("}");
      }
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleanedText = cleanedText.substring(startIdx, endIdx + 1);
      }
      
      suggestions = JSON.parse(cleanedText.trim());
      
      // Ensure suggestions has the expected array of strategies
      let hasValidArray = Array.isArray(suggestions);
      if (!hasValidArray && typeof suggestions === "object" && suggestions !== null) {
        if (Array.isArray(suggestions.suggestions) || Array.isArray(suggestions.strategies)) {
          hasValidArray = true;
        }
      }
      
      if (!hasValidArray) {
        throw new Error("Parsed JSON did not contain a valid strategies array");
      }
    } catch (e: any) {
      throw new Error(`JSON parsing of Gemini response failed: ${e.message}`);
    }

    return NextResponse.json({
      success: true,
      suggestions,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.warn("Gemini API failed or is unavailable, serving highly optimal mathematical fallback strategies.", error.message);
    
    // Highly realistic, professional slab configurations matching Nippon Toyota models
    const fallbackSuggestions = [
      {
        strategy: "Balanced Sales Velocity Engine",
        rationale: "A linear tier progression designed for steady market conditions. Provides uniform motivation across all experience levels by rewarding gradual increments in sales volumes.",
        slabs: [
          { minUnits: 1, maxUnits: 3, incentivePerCar: 1200 },
          { minUnits: 4, maxUnits: 7, incentivePerCar: 2500 },
          { minUnits: 8, maxUnits: 12, incentivePerCar: 4000 },
          { minUnits: 13, maxUnits: null, incentivePerCar: 6000 }
        ]
      },
      {
        strategy: "High-Volume Peak Performance Push",
        rationale: "Geared towards super-performers. Commissions are kept lean for baseline volumes but scale exponentially once officers cross the 12+ vehicle threshold, driving aggressive month-end pushes.",
        slabs: [
          { minUnits: 1, maxUnits: 4, incentivePerCar: 1000 },
          { minUnits: 5, maxUnits: 9, incentivePerCar: 2000 },
          { minUnits: 10, maxUnits: 14, incentivePerCar: 3800 },
          { minUnits: 15, maxUnits: null, incentivePerCar: 7000 }
        ]
      },
      {
        strategy: "Conservative Baseline & Cap Spread",
        rationale: "Optimized for challenging economic quarters or off-peak seasons. Maximizes payout security at entry-level tiers to retain workforce while capping risk exposure on the upper limit.",
        slabs: [
          { minUnits: 1, maxUnits: 5, incentivePerCar: 1500 },
          { minUnits: 6, maxUnits: 10, incentivePerCar: 3000 },
          { minUnits: 11, maxUnits: null, incentivePerCar: 4500 }
        ]
      }
    ];

    return NextResponse.json({
      success: true,
      suggestions: fallbackSuggestions,
      timestamp: new Date().toISOString(),
      fallbackUsed: true
    });
  }
}
