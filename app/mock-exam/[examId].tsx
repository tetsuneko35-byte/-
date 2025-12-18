import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Clock, AlertCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { questionBank } from '@/data/questions';
import { mockExams } from '@/data/mock-exams';
import { Question } from '@/types/question';
import Colors, { MASCOT_IMAGES } from '@/constants/colors';

export default function MockExamScreen() {
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const { addMockExamScore } = useApp();
  const router = useRouter();

  const exam = mockExams.find(e => e.id === examId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [celebrateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!exam) return;
    
    const examQuestions = questionBank.filter(q => exam.questionIds.includes(q.id));
    setQuestions(examQuestions);
    setAnswers(new Array(examQuestions.length).fill(null));
    setTimeRemaining(exam.duration);
  }, [exam]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = useCallback((index: number) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = index;
      return newAnswers;
    });
  }, [currentQuestionIndex]);

  const finishExam = useCallback(() => {
    const correctCount = questions.reduce((count, question, index) => {
      return count + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    const score = Math.round((correctCount / questions.length) * 100);
    addMockExamScore(examId!, score);
    setIsFinished(true);

    Animated.sequence([
      Animated.timing(celebrateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(celebrateAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [questions, answers, addMockExamScore, examId, celebrateAnim]);

  const handleFinish = useCallback(() => {
    const unansweredCount = answers.filter((a) => a === null).length;
    
    if (unansweredCount > 0 && timeRemaining > 0) {
      Alert.alert(
        '未回答の問題があります',
        `${unansweredCount}問が未回答です。本当に終了しますか？`,
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '終了',
            style: 'destructive',
            onPress: () => finishExam(),
          },
        ]
      );
    } else {
      finishExam();
    }
  }, [answers, timeRemaining, finishExam]);

  useEffect(() => {
    if (isFinished || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, questions.length, handleFinish]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exam || questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>試験を準備しています...</Text>
      </View>
    );
  }

  if (isFinished) {
    const correctCount = questions.reduce((count, question, index) => {
      return count + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70;

    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.resultContainer}>
            <Animated.View
              style={[
                styles.resultCharacter,
                {
                  transform: [
                    {
                      scale: celebrateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                    {
                      rotate: celebrateAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: ['0deg', '10deg', '0deg'],
                      }),
                    },
                  ],
                  opacity: celebrateAnim,
                },
              ]}
            >
              <Image 
                source={{ uri: passed ? MASCOT_IMAGES.success : MASCOT_IMAGES.study }} 
                style={styles.resultCharacterImage}
              />
              <Text style={styles.resultCharacterMessage}>
                {passed
                  ? '素晴らしい！合格です！'
                  : 'もう一息！頑張りましょう！'}
              </Text>
            </Animated.View>
            <View
              style={[
                styles.resultHeader,
                { backgroundColor: passed ? Colors.success : Colors.secondary },
              ]}
            >
              <Text style={styles.resultScore}>{score}%</Text>
              <Text style={styles.resultLabel}>
                {correctCount} / {questions.length} 正解
              </Text>
            </View>

            <View style={styles.resultBody}>
              <Text style={styles.resultStatus}>
                {passed ? '合格ライン達成！' : '不合格'}
              </Text>
              <Text style={styles.resultMessage}>
                {passed
                  ? 'おめでとうございます！合格ラインの70%を超えました。'
                  : 'もう少しです！復習してもう一度挑戦しましょう。'}
              </Text>

              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>詳細</Text>
                {questions.map((question, index) => {
                  const userAnswer = answers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  const isAnswered = userAnswer !== null;
                  const isExpanded = expandedQuestion === question.id;

                  return (
                    <TouchableOpacity
                      key={question.id}
                      style={styles.questionResult}
                      onPress={() => setExpandedQuestion(isExpanded ? null : question.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.questionResultHeader}>
                        <Text style={styles.questionResultNumber}>問題 {index + 1}</Text>
                        <View
                          style={[
                            styles.questionResultBadge,
                            {
                              backgroundColor: isAnswered
                                ? isCorrect
                                  ? Colors.success
                                  : Colors.secondary
                                : Colors.textLight,
                            },
                          ]}
                        >
                          <Text style={styles.questionResultBadgeText}>
                            {isAnswered ? (isCorrect ? '正解' : '不正解') : '未回答'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.questionResultCategory}>{question.category}</Text>
                      
                      {isExpanded && (
                        <View style={styles.expandedContent}>
                          <Text style={styles.expandedQuestion}>{question.question}</Text>
                          
                          <View style={styles.expandedOptions}>
                            {question.options.map((option, optIndex) => {
                              const isUserAnswer = userAnswer === optIndex;
                              const isCorrectAnswer = optIndex === question.correctAnswer;
                              
                              return (
                                <View
                                  key={optIndex}
                                  style={[
                                    styles.expandedOption,
                                    isCorrectAnswer && styles.expandedOptionCorrect,
                                    isUserAnswer && !isCorrect && styles.expandedOptionIncorrect,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.expandedOptionText,
                                      (isCorrectAnswer || (isUserAnswer && !isCorrect)) &&
                                        styles.expandedOptionTextHighlight,
                                    ]}
                                  >
                                    {option}
                                    {isCorrectAnswer && ' ✓'}
                                    {isUserAnswer && !isCorrect && ' ✗'}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                          
                          <View style={styles.explanationContainer}>
                            <Text style={styles.explanationTitle}>解説</Text>
                            <Text style={styles.explanationText}>{question.explanation}</Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>戻る</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const answeredCount = answers.filter((a) => a !== null).length;
  const encouragementMessages = [
    { emoji: '😊', text: '頑張って！', threshold: 0 },
    { emoji: '🔥', text: 'いい調子！', threshold: 0.3 },
    { emoji: '💪', text: 'あと少し！', threshold: 0.6 },
    { emoji: '🌟', text: 'ラストスパート！', threshold: 0.8 },
  ];
  const progressRate = answeredCount / questions.length;
  const currentEncouragement = encouragementMessages
    .reverse()
    .find(m => progressRate >= m.threshold) || encouragementMessages[0];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.examHeader}>
        <View style={styles.timerContainer}>
          <Clock color={timeRemaining < 300 ? Colors.secondary : Colors.primary} size={20} />
          <Text
            style={[
              styles.timerText,
              { color: timeRemaining < 300 ? Colors.secondary : Colors.primary },
            ]}
          >
            {formatTime(timeRemaining)}
          </Text>
        </View>
        <View style={styles.answeredContainer}>
          <Text style={styles.answeredText}>
            {answeredCount} / {questions.length}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mascotContainer}>
          <Image source={{ uri: MASCOT_IMAGES.main }} style={styles.mascotImage} />
          <View style={styles.mascotBubble}>
            <Text style={styles.mascotText}>{currentEncouragement.text}</Text>
          </View>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>問題 {currentQuestionIndex + 1}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{currentQuestion.category}</Text>
          </View>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = answers[currentQuestionIndex] === index;

            return (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, isSelected && styles.optionSelected]}
                onPress={() => handleAnswerSelect(index)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.optionCircle,
                      isSelected && styles.optionCircleSelected,
                    ]}
                  />
                  <Text
                    style={[styles.optionText, isSelected && styles.optionTextSelected]}
                  >
                    {option}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.warningCard}>
          <AlertCircle color={Colors.warning} size={20} />
          <Text style={styles.warningText}>
            試験中は解説を見ることができません
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentQuestionIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <Text
              style={[
                styles.navButtonText,
                currentQuestionIndex === 0 && styles.navButtonTextDisabled,
              ]}
            >
              前へ
            </Text>
          </TouchableOpacity>

          {currentQuestionIndex < questions.length - 1 ? (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            >
              <Text style={styles.navButtonText}>次へ</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleFinish}
              activeOpacity={0.8}
            >
              <Text style={styles.finishButtonText}>終了</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  answeredContainer: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  answeredText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: Colors.cardBg,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  questionText: {
    fontSize: 18,
    lineHeight: 28,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionCircleSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  optionTextSelected: {
    fontWeight: '600' as const,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.warning + '10',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  navButtonDisabled: {
    borderColor: Colors.border,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  navButtonTextDisabled: {
    color: Colors.textLight,
  },
  finishButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  resultContainer: {
    flex: 1,
  },
  resultHeader: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 20,
  },
  resultScore: {
    fontSize: 64,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600' as const,
  },
  resultBody: {
    backgroundColor: Colors.cardBg,
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultStatus: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsContainer: {
    gap: 12,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  questionResult: {
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  questionResultNumber: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  questionResultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  questionResultBadgeText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  questionResultCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  expandedQuestion: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text,
    fontWeight: '500' as const,
    marginBottom: 16,
  },
  expandedOptions: {
    gap: 8,
    marginBottom: 16,
  },
  expandedOption: {
    padding: 12,
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  expandedOptionCorrect: {
    backgroundColor: Colors.success + '15',
    borderColor: Colors.success,
  },
  expandedOptionIncorrect: {
    backgroundColor: Colors.secondary + '15',
    borderColor: Colors.secondary,
  },
  expandedOptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  expandedOptionTextHighlight: {
    fontWeight: '600' as const,
  },
  explanationContainer: {
    padding: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  resultCharacter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultCharacterImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  resultCharacterMessage: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: Colors.text,
    textAlign: 'center' as const,
  },
  mascotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  mascotImage: {
    width: 60,
    height: 60,
  },
  mascotBubble: {
    flex: 1,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  mascotText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});
