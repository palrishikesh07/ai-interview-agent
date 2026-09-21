import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Mock session data for testing
    const session = {
      id: sessionId,
      topic: "TypeScript",
      difficulty: "intermediate",
      questionCount: 5,
      status: "in_progress",
      overallScore: null,
      overallFeedback: null,
      questions: [
        {
          id: "q1",
          question: "What is TypeScript?",
          order: 1,
          answer: null,
        },
        {
          id: "q2",
          question: "Explain interfaces",
          order: 2,
          answer: null,
        },
      ],
    };

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
        answer: question.answer,
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
