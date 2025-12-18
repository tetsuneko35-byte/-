export type QuestionCategory = 
  | '物理化学'
  | '有機化学'
  | '薬理学'
  | '薬剤学'
  | '病態・薬物治療'
  | '法規・制度'
  | '実務';

export interface Question {
  id: string;
  category: QuestionCategory;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'normal' | 'hard' | 'expert';
  tags: string[];
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timestamp: number;
  timeSpent: number;
}

export interface CategoryProgress {
  category: QuestionCategory;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  level: number;
}

export interface UserProgress {
  totalXP: number;
  level: number;
  streak: number;
  lastStudyDate: string;
  categoryProgress: CategoryProgress[];
  answeredQuestions: string[];
  mockExamScores: { [examId: string]: number[] };
}
