import { NextRequest, NextResponse } from "next/server";
import { getOrCreateGuestUser } from "../../../lib/guestUser";
import { generateInterviewQuestion } from "../../../lib/interviewAgent";
import { validateInterviewSetup } from "../../../lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const setup = validateInterviewSetup(body);

    if (!setup.valid) {
      return NextResponse.json({ error: setup.error }, { status: 400 });
    }

    const questionText = await generateInterviewQuestion({
      language: setup.language,
      difficulty: setup.difficulty,
      questionNumber: 1,
      questionCount: setup.questionCount,
      history: [],
    });

    const sessionId = Math.random().toString(36).substring(2, 11);

    return NextResponse.json({
      sessionId,
      language: setup.language,
      difficulty: setup.difficulty,
      questionCount: setup.questionCount,
      currentQuestion: {
        order: 1,
        text: questionText,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to start interview" },
      { status: 500 }
    );
  }
}
