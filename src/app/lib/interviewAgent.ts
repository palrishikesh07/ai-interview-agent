import { openai } from "./openai";
import {
  EvaluationResult,
  InterviewRequest,
  InterviewResponse,
  OverallReport,
  PreviousTurn,
} from "../types/interview";

function parseAgentJson<T>(text: string): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1] ?? trimmed;
  return JSON.parse(raw) as T;
}

async function completeJson<T>(prompt: string): Promise<T> {
  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  return parseAgentJson<T>(response.output_text);
}

function formatHistory(history: PreviousTurn[]) {
  if (history.length === 0) {
    return "None yet.";
  }

  return history
    .map((turn, index) => {
      const weaknesses = turn.weaknesses?.length
        ? turn.weaknesses.join("; ")
        : "n/a";
      return `${index + 1}. Q: ${turn.question}
A: ${turn.answer}
Score: ${turn.score ?? "n/a"}
Weaknesses: ${weaknesses}`;
    })
    .join("\n\n");
}

export async function generateInterviewQuestion(input: {
  language: string;
  difficulty: string;
  questionNumber: number;
  questionCount: number;
  history: PreviousTurn[];
}): Promise<string> {
  const result = await completeJson<{ question: string }>(`
You are an AI technical interviewer.

Language / topic: ${input.language}
Difficulty: ${input.difficulty}
Question number: ${input.questionNumber} of ${input.questionCount}

Previous questions and answers:
${formatHistory(input.history)}

Generate one original interview question for this programming language and difficulty.
Do not repeat previous questions.
If the candidate had weaknesses, probe those areas when it still fits the language and difficulty.

Return ONLY valid JSON:
{"question": ""}
`);

  return result.question;
}

export async function evaluateInterviewAnswer(input: {
  language: string;
  difficulty: string;
  question: string;
  answer: string;
}): Promise<EvaluationResult> {
  return completeJson<EvaluationResult>(`
You are an AI technical interviewer evaluating one answer.

Language / topic: ${input.language}
Difficulty: ${input.difficulty}
Question: ${input.question}
Candidate answer: ${input.answer}

Score from 0 to 10. Be fair but specific.

Return ONLY valid JSON:
{
  "score": 0,
  "feedback": "",
  "strengths": [],
  "weaknesses": []
}
`);
}

export async function generateOverallReport(input: {
  language: string;
  difficulty: string;
  history: PreviousTurn[];
}): Promise<OverallReport> {
  return completeJson<OverallReport>(`
You are an AI technical interviewer writing a final report.

Language / topic: ${input.language}
Difficulty: ${input.difficulty}

Interview transcript:
${formatHistory(input.history)}

Give an overall score from 0 to 10 (integer), concise overall feedback, and aggregated strengths and weaknesses.

Return ONLY valid JSON:
{
  "overallScore": 0,
  "overallFeedback": "",
  "strengths": [],
  "weaknesses": []
}
`);
}

export async function runInterviewAgent(
  input: InterviewRequest
): Promise<InterviewResponse> {
  const evaluation = await evaluateInterviewAnswer({
    language: input.topic,
    difficulty: "Intermediate",
    question: input.question ?? "Generate the first question",
    answer: input.answer,
  });

  const nextQuestion = await generateInterviewQuestion({
    language: input.topic,
    difficulty: "Intermediate",
    questionNumber: 2,
    questionCount: 5,
    history: [
      {
        question: input.question ?? "",
        answer: input.answer,
        score: evaluation.score,
        weaknesses: evaluation.weaknesses,
      },
    ],
  });

  return {
    ...evaluation,
    nextQuestion,
  };
}
