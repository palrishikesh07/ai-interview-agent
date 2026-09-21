import { NextRequest, NextResponse } from "next/server";
import {
  evaluateInterviewAnswer,
  generateInterviewQuestion,
  generateOverallReport,
} from "../../../lib/interviewAgent";
import { prisma } from "../../../lib/prisma";
import { PreviousTurn } from "../../../types/interview";

function toHistory(
  questions: Array<{
    question: string;
    answer: {
      answer: string;
      score: number | null;
      weaknesses: unknown;
    } | null;
  }>
): PreviousTurn[] {
  return questions
    .filter((item) => item.answer)
    .map((item) => ({
      question: item.question,
      answer: item.answer!.answer,
      score: item.answer!.score,
      weaknesses: Array.isArray(item.answer!.weaknesses)
        ? (item.answer!.weaknesses as string[])
        : [],
    }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, questionId, answer } = body as {
      sessionId?: string;
      questionId?: string;
      answer?: string;
    };

    if (!sessionId || !questionId || !answer?.trim()) {
      return NextResponse.json(
        { error: "Session, question, and answer are required" },
        { status: 400 }
      );
    }

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { answer: true },
        },
      },
    });

    if (!session || session.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Interview session is not active" },
        { status: 400 }
      );
    }

    const currentQuestion = session.questions.find(
      (question) => question.id === questionId
    );

    if (!currentQuestion) {
      return NextResponse.json(
        { error: "Question not found in this session" },
        { status: 404 }
      );
    }

    if (currentQuestion.answer) {
      return NextResponse.json(
        { error: "This question has already been answered" },
        { status: 400 }
      );
    }

    const evaluation = await evaluateInterviewAnswer({
      language: session.topic,
      difficulty: session.difficulty,
      question: currentQuestion.question,
      answer: answer.trim(),
    });

    await prisma.answer.create({
      data: {
        questionId: currentQuestion.id,
        answer: answer.trim(),
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
      },
    });

    const answeredCount = session.questions.filter((q) => q.answer).length + 1;
    const isComplete = answeredCount >= session.questionCount;

    let nextQuestion: { id: string; text: string; order: number } | null = null;
    let report = null;

    if (!isComplete) {
      const history = [
        ...toHistory(session.questions),
        {
          question: currentQuestion.question,
          answer: answer.trim(),
          score: evaluation.score,
          weaknesses: evaluation.weaknesses,
        },
      ];

      const nextQuestionText = await generateInterviewQuestion({
        language: session.topic,
        difficulty: session.difficulty,
        questionNumber: answeredCount + 1,
        questionCount: session.questionCount,
        history,
      });

      const created = await prisma.question.create({
        data: {
          interviewSessionId: session.id,
          question: nextQuestionText,
          order: answeredCount + 1,
        },
      });

      nextQuestion = {
        id: created.id,
        text: created.question,
        order: created.order,
      };
    } else {
      const history = [
        ...toHistory(session.questions),
        {
          question: currentQuestion.question,
          answer: answer.trim(),
          score: evaluation.score,
          weaknesses: evaluation.weaknesses,
        },
      ];

      report = await generateOverallReport({
        language: session.topic,
        difficulty: session.difficulty,
        history,
      });

      await prisma.interviewSession.update({
        where: { id: session.id },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
          overallScore: report.overallScore,
          overallFeedback: report.overallFeedback,
        },
      });
    }

    return NextResponse.json({
      evaluation,
      answeredCount,
      questionCount: session.questionCount,
      isComplete,
      nextQuestion,
      report,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to submit answer" },
      { status: 500 }
    );
  }
}
