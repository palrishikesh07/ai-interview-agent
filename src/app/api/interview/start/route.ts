import { NextRequest, NextResponse } from "next/server";
import { getOrCreateGuestUser } from "../../../lib/guestUser";
import { generateInterviewQuestion } from "../../../lib/interviewAgent";
import { prisma } from "../../../lib/prisma";
import { validateInterviewSetup } from "../../../lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const setup = validateInterviewSetup(body);

    if (!setup.valid) {
      return NextResponse.json({ error: setup.error }, { status: 400 });
    }

    const user = await getOrCreateGuestUser();
    const questionText = await generateInterviewQuestion({
      language: setup.language,
      difficulty: setup.difficulty,
      questionNumber: 1,
      questionCount: setup.questionCount,
      history: [],
    });

    const session = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        topic: setup.language,
        difficulty: setup.difficulty,
        questionCount: setup.questionCount,
        startedAt: new Date(),
        status: "ACTIVE",
        questions: {
          create: {
            question: questionText,
            order: 1,
          },
        },
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    const firstQuestion = session.questions[0];

    return NextResponse.json({
      sessionId: session.id,
      language: session.topic,
      difficulty: session.difficulty,
      questionCount: session.questionCount,
      currentQuestion: {
        id: firstQuestion.id,
        text: firstQuestion.question,
        order: firstQuestion.order,
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
