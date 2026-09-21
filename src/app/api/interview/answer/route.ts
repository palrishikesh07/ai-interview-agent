import { NextRequest, NextResponse } from "next/server";
import {
  evaluateInterviewAnswer,
  generateInterviewQuestion,
  generateOverallReport,
} from "../../../lib/interviewAgent";
import { PreviousTurn } from "../../../types/interview";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      questionId,
      answer,
      language,
      difficulty,
      questionNumber,
      questionCount,
      history,
      question,
    } = body as {
      sessionId?: string;
      questionId?: string;
      answer?: string;
      language?: string;
      difficulty?: string;
      question?: string;
      questionNumber?: number;
      questionCount?: number;
      history?: PreviousTurn[];
    };

    if (!sessionId || !questionId || !answer?.trim()) {
      return NextResponse.json(
        { error: "Session, question, and answer are required" },
        { status: 400 }
      );
    }

    const lang = language ?? "JavaScript";
    const diff = difficulty ?? "Easy";
    const qNumber = Number(questionNumber) || 1;
    const qCount = Number(questionCount) || 1;
    const prevHistory: PreviousTurn[] = Array.isArray(history) ? history : [];
    const currentQuestionText = question ?? "";

    const evaluation = await evaluateInterviewAnswer({
      language: lang,
      difficulty: diff,
      question: currentQuestionText || `Question ${qNumber}`,
      answer: answer.trim(),
    });

    const answeredCount = qNumber;
    const isComplete = answeredCount >= qCount;

    let nextQuestion: { id: string; text: string; order: number } | null = null;
    let report = null;

    const newHistory: PreviousTurn[] = [
      ...prevHistory,
      {
        question: currentQuestionText || `Question ${qNumber}`,
        answer: answer.trim(),
        score: evaluation.score,
        weaknesses: evaluation.weaknesses,
      },
    ];

    if (!isComplete) {
      const nextQuestionText = await generateInterviewQuestion({
        language: lang,
        difficulty: diff,
        questionNumber: qNumber + 1,
        questionCount: qCount,
        history: newHistory,
      });

      nextQuestion = {
        id: `generated-${qNumber + 1}`,
        text: nextQuestionText,
        order: qNumber + 1,
      };
    } else {
      report = await generateOverallReport({
        language: lang,
        difficulty: diff,
        history: newHistory,
      });
    }

    return NextResponse.json({
      evaluation,
      answeredCount,
      questionCount: qCount,
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
