import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { answer: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Interview session not found" },
        { status: 404 }
      );
    }

    const currentQuestion = session.questions.find((question) => !question.answer);

    return NextResponse.json({
      sessionId: session.id,
      language: session.topic,
      difficulty: session.difficulty,
      questionCount: session.questionCount,
      status: session.status,
      overallScore: session.overallScore,
      overallFeedback: session.overallFeedback,
      currentQuestion: currentQuestion
        ? {
            id: currentQuestion.id,
            text: currentQuestion.question,
            order: currentQuestion.order,
          }
        : null,
      questions: session.questions.map((question) => ({
        id: question.id,
        text: question.question,
        order: question.order,
        answer: question.answer
          ? {
              text: question.answer.answer,
              score: question.answer.score,
              feedback: question.answer.feedback,
              strengths: question.answer.strengths ?? [],
              weaknesses: question.answer.weaknesses ?? [],
            }
          : null,
      })),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to load interview session" },
      { status: 500 }
    );
  }
}
