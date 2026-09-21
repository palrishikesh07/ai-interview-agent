import { NextRequest, NextResponse } from "next/server";
import { generateInterviewQuestion } from "../../../lib/interviewAgent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { language, difficulty, questionNumber, questionCount, history } = body;

    if (!language || !difficulty) {
      return NextResponse.json({ error: "Missing language or difficulty" }, { status: 400 });
    }

    const questionText = await generateInterviewQuestion({
      language,
      difficulty,
      questionNumber: Number(questionNumber) || 1,
      questionCount: Number(questionCount) || 1,
      history: Array.isArray(history) ? history : [],
    });

    return NextResponse.json({ question: questionText });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unable to generate question" }, { status: 500 });
  }
}
