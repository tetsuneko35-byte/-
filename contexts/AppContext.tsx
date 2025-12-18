import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { UserAnswer, UserProgress, QuestionCategory } from '@/types/question';
import { questionBank } from '@/data/questions';

const STORAGE_KEY = '@pharmacy_app_progress';

const categories: QuestionCategory[] = [
  '物理化学',
  '有機化学',
  '薬理学',
  '薬剤学',
  '病態・薬物治療',
  '法規・制度',
  '実務',
];

const getInitialProgress = (): UserProgress => ({
  totalXP: 0,
  level: 1,
  streak: 0,
  lastStudyDate: '',
  categoryProgress: categories.map(cat => ({
    category: cat,
    totalQuestions: questionBank.filter(q => q.category === cat).length,
    answeredQuestions: 0,
    correctAnswers: 0,
    level: 1,
  })),
  answeredQuestions: [],
  mockExamScores: {},
});

export const [AppProvider, useApp] = createContextHook(() => {
  const [progress, setProgress] = useState<UserProgress>(getInitialProgress());
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setProgress(data.progress || getInitialProgress());
        setUserAnswers(data.answers || []);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async (newProgress: UserProgress, newAnswers: UserAnswer[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ progress: newProgress, answers: newAnswers })
      );
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const submitAnswer = useCallback(
    (answer: UserAnswer) => {
      const newAnswers = [...userAnswers, answer];
      const question = questionBank.find(q => q.id === answer.questionId);
      
      if (!question) return;

      const today = new Date().toISOString().split('T')[0];
      const isNewDay = progress.lastStudyDate !== today;
      const newStreak = isNewDay ? progress.streak + 1 : progress.streak;

      const xpGain = answer.isCorrect ? 10 : 3;
      const newXP = progress.totalXP + xpGain;
      const newLevel = Math.floor(newXP / 100) + 1;

      const isNewQuestion = !progress.answeredQuestions.includes(answer.questionId);
      const newAnsweredQuestions = isNewQuestion
        ? [...progress.answeredQuestions, answer.questionId]
        : progress.answeredQuestions;

      const categoryProgress = progress.categoryProgress.map(cat => {
        if (cat.category === question.category) {
          return {
            ...cat,
            answeredQuestions: isNewQuestion
              ? cat.answeredQuestions + 1
              : cat.answeredQuestions,
            correctAnswers: answer.isCorrect
              ? cat.correctAnswers + 1
              : cat.correctAnswers,
            level: Math.floor((cat.correctAnswers + (answer.isCorrect ? 1 : 0)) / 5) + 1,
          };
        }
        return cat;
      });

      const newProgress: UserProgress = {
        ...progress,
        totalXP: newXP,
        level: newLevel,
        streak: newStreak,
        lastStudyDate: today,
        categoryProgress,
        answeredQuestions: newAnsweredQuestions,
      };

      setProgress(newProgress);
      setUserAnswers(newAnswers);
      saveProgress(newProgress, newAnswers);
    },
    [progress, userAnswers]
  );

  const addMockExamScore = useCallback(
    (examId: string, score: number) => {
      const examScores = progress.mockExamScores[examId] || [];
      const newProgress = {
        ...progress,
        mockExamScores: {
          ...progress.mockExamScores,
          [examId]: [...examScores, score],
        },
      };
      setProgress(newProgress);
      saveProgress(newProgress, userAnswers);
    },
    [progress, userAnswers]
  );

  const resetProgress = useCallback(async () => {
    const initial = getInitialProgress();
    setProgress(initial);
    setUserAnswers([]);
    await saveProgress(initial, []);
  }, []);

  return {
    progress,
    userAnswers,
    isLoading,
    submitAnswer,
    addMockExamScore,
    resetProgress,
  };
});
