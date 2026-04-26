import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { actionType, context } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in the environment variables." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are AgroInsight's intelligent AI farming assistant. 
A user has requested to perform the action: "${actionType}". 
Here is some contextual data from their dashboard: ${JSON.stringify(context)}.
Provide a concise, actionable, and helpful response (max 3-4 sentences) that tells the user what insights or recommendations they should consider regarding this action. Act as if you are completing the action or providing the required report/insight. Format with markdown if needed, but keep it brief and highly relevant.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response. Please try again later." },
      { status: 500 }
    );
  }
}
