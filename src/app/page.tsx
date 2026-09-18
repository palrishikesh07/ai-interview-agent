"use client";

import { useState } from "react";

interface Result {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  nextQuestion: string;
}

export default function Home() {

  const [topic, setTopic] = useState("Node.js");

  const [question, setQuestion] = useState(
    "Explain the Node.js event loop."
  );

  const [answer, setAnswer] = useState("");

  const [result, setResult] = useState<Result | null>(null);

  const [loading, setLoading] = useState(false);

  async function submitAnswer() {

    setLoading(true);

    try {

      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          question,
          answer,
        }),
      });

      const data = await response.json();

      setResult(data);

      if (data.nextQuestion) {
        setQuestion(data.nextQuestion);
      }

      setAnswer("");

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  }

  return (
    <main className="min-h-screen p-10">

      <div className="mx-auto max-w-3xl">

        <h1 className="text-4xl font-bold">
          AI Interview Agent
        </h1>

        <p className="mt-2">
          AI-powered technical interview practice
        </p>

        <div className="mt-8">

          <label>Technology</label>

          <input
            className="mt-2 w-full rounded border p-3"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

        </div>

        <div className="mt-6">

          <h2 className="text-xl font-semibold">
            Question
          </h2>

          <div className="mt-2 rounded  p-4">
            {question}
          </div>

        </div>

        <div className="mt-6">

          <textarea
            className="h-40 w-full rounded border p-3"
            placeholder="Enter your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

        </div>

        <button
          onClick={submitAnswer}
          disabled={loading || !answer}
          className="mt-4 rounded bg-black px-6 py-3 text-white"
        >
          {loading ? "AI Evaluating..." : "Submit Answer"}
        </button>

        {result && (

          <div className="mt-8 rounded border p-6">

            <h2 className="text-2xl font-bold">
              Score: {result.score}/10
            </h2>

            <p className="mt-4">
              {result.feedback}
            </p>

            <h3 className="mt-4 font-bold">
              Strengths
            </h3>

            <ul>
              {result.strengths?.map((item, index) => (
                <li key={index}>✓ {item}</li>
              ))}
            </ul>

            <h3 className="mt-4 font-bold">
              Weaknesses
            </h3>

            <ul>
              {result.weaknesses?.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>

            <h3 className="mt-6 font-bold">
              Next Question
            </h3>

            <p className="mt-2">
              {result.nextQuestion}
            </p>

          </div>

        )}

      </div>

    </main>
  );
}