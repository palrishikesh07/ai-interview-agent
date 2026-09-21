import {
  DIFFICULTY_LEVELS,
  PROGRAMMING_LANGUAGES,
  QUESTION_COUNTS,
} from "./interviewConfig";

export function validateInterviewInput(topic: string, answer: string) {
  if (!topic?.trim()) {
    return false;
  }

  if (!answer?.trim()) {
    return false;
  }

  return true;
}

export function validateInterviewSetup(input: {
  language?: string;
  difficulty?: string;
  questionCount?: number;
}) {
  const language = input.language?.trim();
  const difficulty = input.difficulty?.trim();
  const questionCount = Number(input.questionCount);

  if (!language || !PROGRAMMING_LANGUAGES.includes(language as never)) {
    return { valid: false as const, error: "Select a supported programming language" };
  }

  if (!difficulty || !DIFFICULTY_LEVELS.includes(difficulty as never)) {
    return { valid: false as const, error: "Select a difficulty level" };
  }

  if (!QUESTION_COUNTS.includes(questionCount as never)) {
    return { valid: false as const, error: "Select a valid number of questions" };
  }

  return {
    valid: true as const,
    language,
    difficulty,
    questionCount,
  };
}
