import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Award, BookOpen, Target } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { questionBank } from '@/data/questions';
import Colors from '@/constants/colors';

export default function StatsScreen() {
  const { progress, userAnswers } = useApp();

  const stats = useMemo(() => {
    const totalAnswered = userAnswers.length;
    const correctAnswers = userAnswers.filter((a) => a.isCorrect).length;
    const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;

    const totalTime = userAnswers.reduce((sum, a) => sum + a.timeSpent, 0);
    const avgTime = totalAnswered > 0 ? totalTime / totalAnswered : 0;

    const weakCategories = progress.categoryProgress
      .map((cat) => {
        const categoryAnswers = userAnswers.filter((a) => {
          const q = questionBank.find(
            (qu) => qu.id === a.questionId
          );
          return q?.category === cat.category;
        });
        const catCorrect = categoryAnswers.filter((a) => a.isCorrect).length;
        const catTotal = categoryAnswers.length;
        const catAccuracy = catTotal > 0 ? (catCorrect / catTotal) * 100 : 0;
        return { ...cat, accuracy: catAccuracy };
      })
      .filter((cat) => cat.accuracy < 70 && cat.answeredQuestions > 0)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    return { totalAnswered, correctAnswers, accuracy, avgTime, weakCategories };
  }, [progress, userAnswers]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>統計</Text>
        <Text style={styles.subtitle}>あなたの学習データ</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#F0F9FF' }]}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primary }]}>
              <BookOpen color="#FFF" size={24} />
            </View>
            <Text style={styles.statValue}>{stats.totalAnswered}</Text>
            <Text style={styles.statLabel}>総回答数</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F0FFF4' }]}>
            <View style={[styles.statIcon, { backgroundColor: Colors.success }]}>
              <Target color="#FFF" size={24} />
            </View>
            <Text style={styles.statValue}>{stats.accuracy.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>正答率</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#FFF9F0' }]}>
            <View style={[styles.statIcon, { backgroundColor: Colors.accent }]}>
              <Award color="#FFF" size={24} />
            </View>
            <Text style={styles.statValue}>{progress.level}</Text>
            <Text style={styles.statLabel}>レベル</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFF5F5' }]}>
            <View style={[styles.statIcon, { backgroundColor: Colors.secondary }]}>
              <TrendingUp color="#FFF" size={24} />
            </View>
            <Text style={styles.statValue}>{stats.avgTime.toFixed(0)}秒</Text>
            <Text style={styles.statLabel}>平均回答時間</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>カテゴリ別成績</Text>
          {progress.categoryProgress.map((cat) => {
            const percentage =
              cat.totalQuestions > 0
                ? (cat.correctAnswers / cat.answeredQuestions) * 100
                : 0;

            return (
              <View key={cat.category} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{cat.category}</Text>
                  <Text
                    style={[
                      styles.categoryPercentage,
                      {
                        color:
                          percentage >= 70
                            ? Colors.success
                            : percentage >= 50
                            ? Colors.warning
                            : Colors.secondary,
                      },
                    ]}
                  >
                    {cat.answeredQuestions > 0 ? percentage.toFixed(0) : 0}%
                  </Text>
                </View>
                <View style={styles.categoryStats}>
                  <Text style={styles.categoryStatsText}>
                    正解: {cat.correctAnswers} / {cat.answeredQuestions}
                  </Text>
                  <Text style={styles.categoryStatsText}>
                    進捗: {cat.answeredQuestions} / {cat.totalQuestions}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(cat.answeredQuestions / cat.totalQuestions) * 100}%`,
                        backgroundColor: Colors.categories[cat.category],
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {stats.weakCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>強化すべきカテゴリ</Text>
            {stats.weakCategories.map((cat) => (
              <View key={cat.category} style={styles.weakCard}>
                <Text style={styles.weakCategoryName}>{cat.category}</Text>
                <Text style={styles.weakAccuracy}>正答率 {cat.accuracy.toFixed(0)}%</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  section: {
    marginTop: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  categoryPercentage: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryStatsText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  weakCard: {
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
  },
  weakCategoryName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  weakAccuracy: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.secondary,
  },
});
