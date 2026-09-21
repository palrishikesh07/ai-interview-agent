export const PROGRAMMING_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "Go",
  "Rust",
  "Node.js",
  "SQL",
  "React",
] as const;

export const DIFFICULTY_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export const QUESTION_COUNTS = [3, 5, 7, 10] as const;

export type ProgrammingLanguage = (typeof PROGRAMMING_LANGUAGES)[number];
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];
export type QuestionCount = (typeof QUESTION_COUNTS)[number];
