"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DIFFICULTY_LEVELS,
  PROGRAMMING_LANGUAGES,
  QUESTION_COUNTS,
} from "./lib/interviewConfig";

export default function Home() {
  const router = useRouter();
  const [language, setLanguage] = useState(PROGRAMMING_LANGUAGES[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS[1]);
  const [questionCount, setQuestionCount] = useState(QUESTION_COUNTS[1]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startInterview(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, difficulty, questionCount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to start interview");
      }

      router.push(
        `/interview/${data.sessionId}?language=${encodeURIComponent(
          language
        )}&difficulty=${encodeURIComponent(difficulty)}&questionCount=${encodeURIComponent(
          String(questionCount)
        )}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-medium tracking-wide uppercase">
          Practice interview
        </p>
        <h1 className="mt-2 text-4xl font-bold">AI Interview Agent</h1>
        <p className="mt-3 text-base opacity-80">
          Choose a language, difficulty, and number of questions. You will
          answer one question at a time, then get a full report.
        </p>

        <form onSubmit={startInterview} className="mt-10 space-y-6">
          <label className="block">
            <span className="text-sm font-medium">Programming language</span>
            <select
              className="mt-2 w-full rounded border border-current/20 bg-transparent p-3"
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as typeof language)
              }
            >
              {PROGRAMMING_LANGUAGES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="text-sm font-medium">Difficulty</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`rounded border px-3 py-2 text-sm ${
                    difficulty === level
                      ? "border-current bg-black text-white dark:bg-white dark:text-black"
                      : "border-current/20"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium">Number of questions</legend>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {QUESTION_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`rounded border px-3 py-2 text-sm ${
                    questionCount === count
                      ? "border-current bg-black text-white dark:bg-white dark:text-black"
                      : "border-current/20"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </fieldset>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-black px-6 py-3 text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {loading ? "Preparing questions..." : "Start interview"}
          </button>
        </form>
      </div>
    </main>
  );
}
