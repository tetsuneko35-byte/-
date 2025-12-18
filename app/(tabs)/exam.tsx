import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FileText, Clock, Target, TrendingUp, Trophy } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { mockExams } from '@/data/mock-exams';
import Colors from '@/constants/colors';

export default function ExamScreen() {
  const { progress } = useApp();
  const router = useRouter();

  const totalExamsTaken = Object.values(progress.mockExamScores).reduce(
    (total, examScores) => total + examScores.length,
    0
  );
  const allScores = Object.values(progress.mockExamScores).flat();
  const averageScore = allScores.length > 0
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>模擬試験</Text>
        <Text style={styles.subtitle}>本番形式で実力を試そう</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.infoGrid}>
          <View style={[styles.infoCard, { backgroundColor: '#FFF5F5' }]}>
            <View style={[styles.infoIcon, { backgroundColor: Colors.secondary }]}>
              <Target color="#FFF" size={20} />
            </View>
            <Text style={styles.infoValue}>{totalExamsTaken}</Text>
            <Text style={styles.infoLabel}>受験回数</Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#F0FFF4' }]}>
            <View style={[styles.infoIcon, { backgroundColor: Colors.success }]}>
              <TrendingUp color="#FFF" size={20} />
            </View>
            <Text style={styles.infoValue}>{averageScore.toFixed(0)}%</Text>
            <Text style={styles.infoLabel}>平均点</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>模擬試験一覧</Text>
          <View style={styles.examList}>
            {mockExams.map((exam) => {
              const examScores = progress.mockExamScores[exam.id] || [];
              const lastScore = examScores.length > 0 ? examScores[examScores.length - 1] : null;
              const difficultyColors = {
                standard: '#4CAF50',
                hard: '#FF9800',
                expert: '#F44336',
                mixed: '#2196F3',
              };

              return (
                <TouchableOpacity
                  key={exam.id}
                  style={styles.examCard}
                  onPress={() => router.push(`/mock-exam/${exam.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.examCardHeader}>
                    <View style={styles.examCardLeft}>
                      <FileText color={Colors.primary} size={24} />
                    </View>
                    <View style={styles.examCardBody}>
                      <Text style={styles.examCardTitle}>{exam.title}</Text>
                      <Text style={styles.examCardDescription}>{exam.description}</Text>
                      <View style={styles.examCardMeta}>
                        <View style={styles.metaItem}>
                          <Clock color={Colors.textSecondary} size={14} />
                          <Text style={styles.metaText}>{exam.duration / 60}分</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <FileText color={Colors.textSecondary} size={14} />
                          <Text style={styles.metaText}>{exam.totalQuestions}問</Text>
                        </View>
                        <View
                          style={[
                            styles.difficultyBadge,
                            { backgroundColor: difficultyColors[exam.difficulty] + '20' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.difficultyText,
                              { color: difficultyColors[exam.difficulty] },
                            ]}
                          >
                            {exam.difficulty === 'standard'
                              ? '標準'
                              : exam.difficulty === 'hard'
                              ? '難'
                              : exam.difficulty === 'expert'
                              ? '最難'
                              : '総合'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {lastScore !== null && (
                    <View style={styles.lastScoreContainer}>
                      <Trophy color={lastScore >= 70 ? Colors.success : Colors.textSecondary} size={16} />
                      <Text style={styles.lastScoreText}>前回: {lastScore}%</Text>
                      <Text style={styles.attemptsText}>({examScores.length}回)</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>


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
  startCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  startCardIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startCardText: {
    flex: 1,
  },
  startCardTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  startCardSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  scoreCard: {
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreLeft: {
    gap: 4,
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  scoreDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  scoreRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  scoreStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  examList: {
    gap: 16,
  },
  examCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  examCardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  examCardLeft: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  examCardBody: {
    flex: 1,
  },
  examCardTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  examCardDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  examCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  lastScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  lastScoreText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  attemptsText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
