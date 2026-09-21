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

export interface EvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export interface OverallReport {
  overallScore: number;
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
}

export interface PreviousTurn {
  question: string;
  answer: string;
  score?: number | null;
  weaknesses?: string[];
}
