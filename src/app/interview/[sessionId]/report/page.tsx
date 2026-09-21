"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type QuestionResult = {
  id: string;
  text: string;
  order: number;
  answer: {
    text: string;
    score: number | null;
    feedback: string | null;
    strengths: string[];
    weaknesses: string[];
  } | null;
};

type ReportPayload = {
  language: string;
  difficulty: string;
  questionCount: number;
  status: string;
  overallScore: number | null;
  overallFeedback: string | null;
  questions: QuestionResult[];
};

export default function InterviewReportPage() {
  const params = useParams<{ sessionId: string }>();
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const response = await fetch(`/api/interview/${params.sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load report");
        }

        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [params.sessionId]);

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-16">
        <p className="mx-auto max-w-3xl">Loading report...</p>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen px-6 py-16">
        <p className="mx-auto max-w-3xl text-red-600">
          {error || "Report not found"}
        </p>
      </main>
    );
  }

  const answeredScores = report.questions
    .map((question) => question.answer?.score)
    .filter((score): score is number => typeof score === "number");
  const averageScore =
    answeredScores.length > 0
      ? Math.round(
          (answeredScores.reduce((sum, score) => sum + score, 0) /
            answeredScores.length) *
            10
        ) / 10
      : null;

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm opacity-70">
          {report.language} · {report.difficulty} · {report.questionCount}{" "}
          questions
        </p>
        <h1 className="mt-2 text-3xl font-bold">Interview report</h1>

        <section className="mt-8 rounded border border-current/15 p-6">
          <h2 className="text-2xl font-bold">
            Overall score: {report.overallScore ?? averageScore ?? "—"}/10
          </h2>
          <p className="mt-4 leading-7">
            {report.overallFeedback ||
              "Finish every question to generate overall feedback."}
          </p>
        </section>

        <div className="mt-8 space-y-4">
          {report.questions.map((question) => (
            <article
              key={question.id}
              className="rounded border border-current/15 p-5"
            >
              <h3 className="font-semibold">
                Question {question.order}: {question.text}
              </h3>
              {question.answer ? (
                <>
                  <p className="mt-3 text-sm opacity-80">
                    Your answer: {question.answer.text}
                  </p>
                  <p className="mt-2 font-medium">
                    Score: {question.answer.score ?? "—"}/10
                  </p>
                  <p className="mt-2">{question.answer.feedback}</p>
                </>
              ) : (
                <p className="mt-3 text-sm opacity-70">Not answered</p>
              )}
            </article>
          ))}
        </div>

        <Link
          href="/"
          className="mt-8 inline-block rounded bg-black px-6 py-3 text-white dark:bg-white dark:text-black"
        >
          Start a new interview
        </Link>
      </div>
    </main>
  );
}
