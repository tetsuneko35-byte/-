import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Trophy, Target, TrendingUp, Sparkles } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors, { MASCOT_IMAGES } from '@/constants/colors';
import { useRouter } from 'expo-router';
import AdBanner from '@/components/AdBanner';

export default function HomeScreen() {
  const { progress, isLoading } = useApp();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  const levelProgress = (progress.totalXP % 100) / 100;
  const totalQuestions = progress.categoryProgress.reduce(
    (sum, cat) => sum + cat.totalQuestions,
    0
  );
  const answeredQuestions = progress.answeredQuestions.length;
  const totalCorrect = progress.categoryProgress.reduce(
    (sum, cat) => sum + cat.correctAnswers,
    0
  );
  const accuracy = answeredQuestions > 0 ? (totalCorrect / answeredQuestions) * 100 : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Image source={{ uri: MASCOT_IMAGES.main }} style={styles.mascotImage} />
              <View>
                <Text style={styles.greeting}>薬剤師国家試験</Text>
                <Text style={styles.title}>合格への道</Text>
              </View>
            </View>
            <View style={styles.levelBadge}>
              <Sparkles color={Colors.accent} size={20} />
              <Text style={styles.levelText}>Lv.{progress.level}</Text>
            </View>
          </View>

          <View style={styles.xpContainer}>
            <Text style={styles.xpLabel}>
              {progress.totalXP % 100} / 100 XP
            </Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${levelProgress * 100}%` }]} />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#FFF5F5' }]}>
            <View style={[styles.statIcon, { backgroundColor: Colors.secondary }]}>
              <Flame color="#FFF" size={24} />
            </View>
            <Text style={styles.statValue}>{progress.streak}</Text>
            <Text style={styles.statLabel}>連続日数</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFF9F0' }]}>
            <View style={[styles.statIcon, { backgroundColor: Colors.accent }]}>
              <Trophy color="#FFF" size={24} />
            </View>
            <Text style={styles.statValue}>{answeredQuestions}</Text>
            <Text style={styles.statLabel}>回答数</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F0FFF4' }]}>
            <View style={[styles.statIcon, { backgroundColor: Colors.success }]}>
              <Target color="#FFF" size={24} />
            </View>
            <Text style={styles.statValue}>{accuracy.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>正答率</Text>
          </View>
        </View>

        <AdBanner />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日の学習</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/study')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.actionContent}>
                <View>
                  <Text style={styles.actionTitle}>問題を解く</Text>
                  <Text style={styles.actionSubtitle}>
                    カテゴリ別に学習しよう
                  </Text>
                </View>
                <TrendingUp color="#FFF" size={32} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/exam')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionGradient, { backgroundColor: Colors.secondary }]}>
              <View style={styles.actionContent}>
                <View>
                  <Text style={styles.actionTitle}>模擬試験</Text>
                  <Text style={styles.actionSubtitle}>
                    本番形式で実力を試そう
                  </Text>
                </View>
                <Trophy color="#FFF" size={32} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>進捗状況</Text>
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              全体の進捗: {answeredQuestions} / {totalQuestions} 問
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(answeredQuestions / totalQuestions) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        <AdBanner />

        {Object.values(progress.mockExamScores).flat().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>模擬試験の結果</Text>
            <View style={styles.examScoresContainer}>
              {Object.values(progress.mockExamScores).flat().slice(-3).reverse().map((score: number, index: number) => (
                <View key={index} style={styles.examScoreCard}>
                  <Text style={styles.examScoreValue}>{score}%</Text>
                  <Text style={styles.examScoreLabel}>最近の結果</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <AdBanner size="large" />
      </View>
    </ScrollView>
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
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mascotImage: {
    width: 56,
    height: 56,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500' as const,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginTop: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  xpContainer: {
    gap: 8,
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  xpBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 6,
  },
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  actionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionGradient: {
    padding: 20,
    borderRadius: 16,
  },
  actionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressCard: {
    backgroundColor: Colors.cardBg,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  examScoresContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  examScoreCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  examScoreValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  examScoreLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
