export interface MockExam {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  difficulty: 'standard' | 'hard' | 'expert' | 'mixed';
  questionIds: string[];
}

export const mockExams: MockExam[] = [
  {
    id: 'exam1',
    title: '第1回 総合模擬試験',
    description: '基礎から応用まで幅広く出題。初めての方におすすめ。',
    duration: 30 * 60,
    totalQuestions: 20,
    difficulty: 'mixed',
    questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20'],
  },
  {
    id: 'exam2',
    title: '第2回 薬理学・薬剤学中心',
    description: '薬理学と薬剤学を中心とした出題。実務に直結する知識を試す。',
    duration: 30 * 60,
    totalQuestions: 20,
    difficulty: 'mixed',
    questionIds: ['q21', 'q22', 'q23', 'q24', 'q25', 'q26', 'q27', 'q28', 'q29', 'q30', 'q31', 'q32', 'q33', 'q34', 'q35', 'q36', 'q37', 'q38', 'q39', 'q40'],
  },
  {
    id: 'exam3',
    title: '第3回 物理・有機化学特訓',
    description: '物理化学と有機化学の理解度を徹底チェック。計算問題も多数。',
    duration: 30 * 60,
    totalQuestions: 20,
    difficulty: 'hard',
    questionIds: ['q41', 'q42', 'q43', 'q44', 'q45', 'q46', 'q47', 'q48', 'q49', 'q50', 'q51', 'q52', 'q53', 'q54', 'q55', 'q56', 'q57', 'q58', 'q59', 'q60'],
  },
  {
    id: 'exam4',
    title: '第4回 病態・実務重点',
    description: '病態生理と実務を中心に出題。臨床的な判断力を養う。',
    duration: 30 * 60,
    totalQuestions: 20,
    difficulty: 'mixed',
    questionIds: ['q61', 'q62', 'q63', 'q64', 'q65', 'q66', 'q67', 'q68', 'q69', 'q70', 'q71', 'q72', 'q73', 'q74', 'q75', 'q76', 'q77', 'q78', 'q79', 'q80'],
  },
  {
    id: 'exam5',
    title: '第5回 国試直前総仕上げ',
    description: '最高難易度。全カテゴリから厳選した難問で最終確認。',
    duration: 30 * 60,
    totalQuestions: 20,
    difficulty: 'expert',
    questionIds: ['q81', 'q82', 'q83', 'q84', 'q85', 'q86', 'q87', 'q88', 'q89', 'q90', 'q91', 'q92', 'q93', 'q94', 'q95', 'q96', 'q97', 'q98', 'q99', 'q100'],
  },
];
