import { openai } from "./openai";
import {
  InterviewRequest,
  InterviewResponse,
} from "../types/interview";

export async function runInterviewAgent(
  input: InterviewRequest
): Promise<InterviewResponse> {

  const prompt = `
You are an AI technical interview agent.

Topic:
${input.topic}

Previous Question:
${input.question ?? "Generate the first question"}

Candidate Answer:
${input.answer}

Your responsibilities:

1. Evaluate the candidate answer.
2. Give a score from 0 to 10.
3. Identify strengths.
4. Identify weaknesses.
5. Provide concise feedback.
6. Generate the next interview question.
7. The next question should focus on weaknesses where possible.

Return ONLY valid JSON.

Expected format:

{
  "score": 0,
  "feedback": "",
  "strengths": [],
  "weaknesses": [],
  "nextQuestion": ""
}
`;

  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  const text = response.output_text;

  return JSON.parse(text);
}