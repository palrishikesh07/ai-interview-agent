"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Evaluation = {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
};

type CurrentQuestion = {
  id: string;
  text: string;
  order: number;
};

type SessionPayload = {
  sessionId: string;
  language: string;
  difficulty: string;
  questionCount: number;
  status: string;
  currentQuestion: CurrentQuestion | null;
};

export default function InterviewSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;

  const search = useSearchParams();

  const qsLanguage = search.get("language") ?? "JavaScript";
  const qsDifficulty = search.get("difficulty") ?? "Easy";
  const qsQuestionCount = Number(search.get("questionCount") ?? "1") || 1;

  const [session, setSession] = useState<SessionPayload | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [nextQuestion, setNextQuestion] = useState<CurrentQuestion | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    async function loadGeneratedQuestion() {
      try {
        setLoading(true);

        const res = await fetch(`/api/interview/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: qsLanguage,
            difficulty: qsDifficulty,
            questionNumber: 1,
            questionCount: qsQuestionCount,
            history: [],
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Unable to generate question");
        }

        setSession({
          sessionId,
          language: qsLanguage,
          difficulty: qsDifficulty,
          questionCount: qsQuestionCount,
          status: "IN_PROGRESS",
          currentQuestion: {
            id: "generated-1",
            text: data.question,
            order: 1,
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadGeneratedQuestion();
  }, [qsLanguage, qsDifficulty, qsQuestionCount, sessionId]);

  async function submitAnswer() {
    if (!session?.currentQuestion) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: session.currentQuestion.id,
          answer,
          language: session.language,
          difficulty: session.difficulty,
          question: session.currentQuestion.text,
          questionNumber: session.currentQuestion.order,
          questionCount: session.questionCount,
          history: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit answer");
      }

      setEvaluation(data.evaluation);
      setNextQuestion(data.nextQuestion);
      setIsComplete(data.isComplete);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function continueInterview() {
    if (isComplete) {
      router.push(`/interview/${sessionId}/report`);
      return;
    }

    if (!nextQuestion || !session) {
      return;
    }

    setSession({
      ...session,
      currentQuestion: nextQuestion,
    });
    setAnswer("");
    setEvaluation(null);
    setNextQuestion(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-16">
        <p className="mx-auto max-w-3xl">Loading interview...</p>
      </main>
    );
  }

  if (error && !session) {
    return (
      <main className="min-h-screen px-6 py-16">
        <p className="mx-auto max-w-3xl text-red-600">{error}</p>
      </main>
    );
  }

  if (!session?.currentQuestion) {
    return (
      <main className="min-h-screen px-6 py-16">
        <p className="mx-auto max-w-3xl">No active question found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm opacity-70">
          {session.language} · {session.difficulty} · Question{" "}
          {session.currentQuestion.order} of {session.questionCount}
        </p>
        <h1 className="mt-2 text-3xl font-bold">Interview session</h1>

        <section className="mt-8 rounded border border-current/15 p-5">
          <h2 className="text-sm font-medium uppercase tracking-wide">
            Question
          </h2>
          <p className="mt-3 text-lg leading-7">{session.currentQuestion.text}</p>
        </section>

        <textarea
          className="mt-6 h-44 w-full rounded border border-current/20 bg-transparent p-3"
          placeholder="Write your answer..."
          value={answer}
          disabled={Boolean(evaluation) || submitting}
          onChange={(event) => setAnswer(event.target.value)}
        />

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        {!evaluation ? (
          <button
            onClick={submitAnswer}
            disabled={submitting || !answer.trim()}
            className="mt-4 rounded bg-black px-6 py-3 text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {submitting ? "Evaluating..." : "Submit answer"}
          </button>
        ) : (
          <section className="mt-8 rounded border border-current/15 p-6">
            <h2 className="text-2xl font-bold">Score: {evaluation.score}/10</h2>
            <p className="mt-4">{evaluation.feedback}</p>

            <h3 className="mt-5 font-semibold">Strengths</h3>
            <ul className="mt-2 list-disc pl-5">
              {evaluation.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 className="mt-5 font-semibold">Areas to improve</h3>
            <ul className="mt-2 list-disc pl-5">
              {evaluation.weaknesses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <button
              onClick={continueInterview}
              className="mt-6 rounded bg-black px-6 py-3 text-white dark:bg-white dark:text-black"
            >
              {isComplete ? "View report" : "Next question"}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
