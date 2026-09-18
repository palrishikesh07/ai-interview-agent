export interface InterviewRequest {
  topic: string;
  answer: string;
  question?: string;
}

export interface InterviewResponse {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  nextQuestion: string;
}