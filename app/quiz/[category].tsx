import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, X, ChevronRight, Sparkles } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { questionBank } from '@/data/questions';
import { Question, QuestionCategory } from '@/types/question';
import Colors, { MASCOT_IMAGES } from '@/constants/colors';

export default function QuizScreen() {
  const params = useLocalSearchParams<{ category: string }>();
  const category = decodeURIComponent(params.category || '') as QuestionCategory;
  const { submitAnswer, progress } = useApp();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [fadeAnim] = useState(new Animated.Value(1));
  const [characterAnim] = useState(new Animated.Value(0));
  const [bounceAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const categoryQuestions = questionBank.filter((q) => q.category === category);
    const answeredIds = progress.answeredQuestions;
    const unansweredQuestions = categoryQuestions.filter(
      (q) => !answeredIds.includes(q.id)
    );

    const questionsToUse =
      unansweredQuestions.length >= 5 ? unansweredQuestions : categoryQuestions;

    const shuffled = [...questionsToUse].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
  }, [category, progress.answeredQuestions]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = useCallback((index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  }, [showResult]);

  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    submitAnswer({
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timestamp: Date.now(),
      timeSpent,
    });

    setShowResult(true);

    Animated.parallel([
      Animated.spring(characterAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
      ]),
    ]).start();
  }, [selectedAnswer, currentQuestion, startTime, submitAnswer, characterAnim, bounceAnim]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setStartTime(Date.now());
      characterAnim.setValue(0);
      bounceAnim.setValue(1);
    } else {
      router.back();
    }
  }, [currentQuestionIndex, questions.length, fadeAnim, router, characterAnim, bounceAnim]);

  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>問題を読み込んでいます...</Text>
      </View>
    );
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} / {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.characterContainer,
            {
              transform: [
                { scale: bounceAnim },
                {
                  translateY: characterAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
              opacity: characterAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0, 1],
              }),
            },
          ]}
        >
          {showResult && (
            <View style={styles.character}>
              <Image 
                source={{ uri: isCorrect ? MASCOT_IMAGES.success : MASCOT_IMAGES.encourage }} 
                style={styles.characterImage}
              />
              <View style={styles.characterBubble}>
                <Text style={styles.characterText}>
                  {isCorrect
                    ? ['すごい！', 'やったね！', '完璧です！', '天才！'][Math.floor(Math.random() * 4)]
                    : ['次は頑張ろう！', 'もう少し！', '復習しよう！', 'ファイト！'][Math.floor(Math.random() * 4)]}
                </Text>
                {isCorrect && <Sparkles color={Colors.accent} size={16} style={styles.sparkle} />}
              </View>
            </View>
          )}
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.questionCard}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{currentQuestion.category}</Text>
            </View>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === currentQuestion.correctAnswer;
              const showCorrect = showResult && isCorrectAnswer;
              const showIncorrect = showResult && isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && !showResult && styles.optionSelected,
                    showCorrect && styles.optionCorrect,
                    showIncorrect && styles.optionIncorrect,
                  ]}
                  onPress={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.optionCircle,
                        isSelected && !showResult && styles.optionCircleSelected,
                        showCorrect && styles.optionCircleCorrect,
                        showIncorrect && styles.optionCircleIncorrect,
                      ]}
                    >
                      {showCorrect && <Check color="#FFF" size={16} />}
                      {showIncorrect && <X color="#FFF" size={16} />}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        (isSelected && !showResult) || showCorrect || showIncorrect
                          ? styles.optionTextSelected
                          : {},
                      ]}
                    >
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {showResult && (
            <Animated.View style={styles.resultCard}>
              <View
                style={[
                  styles.resultHeader,
                  { backgroundColor: isCorrect ? Colors.success : Colors.secondary },
                ]}
              >
                <Text style={styles.resultTitle}>
                  {isCorrect ? '正解！' : '不正解'}
                </Text>
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.explanationTitle}>解説</Text>
                <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        {!showResult ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              selectedAnswer === null && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={selectedAnswer === null}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>回答する</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex < questions.length - 1 ? '次の問題' : '完了'}
            </Text>
            <ChevronRight color="#FFF" size={20} />
          </TouchableOpacity>
        )}
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressContainer: {
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  character: {
    alignItems: 'center',
    gap: 12,
  },
  characterImage: {
    width: 120,
    height: 120,
  },
  characterBubble: {
    backgroundColor: Colors.cardBg,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    position: 'relative' as const,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  characterText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  sparkle: {
    marginLeft: 4,
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
  optionCorrect: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
  },
  optionIncorrect: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary + '10',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCircleSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  optionCircleCorrect: {
    borderColor: Colors.success,
    backgroundColor: Colors.success,
  },
  optionCircleIncorrect: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary,
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
  resultCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultHeader: {
    padding: 16,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  resultContent: {
    padding: 20,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
});
