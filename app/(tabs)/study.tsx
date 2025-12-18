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
import { ChevronRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { QuestionCategory } from '@/types/question';

const categories: { name: QuestionCategory; icon: string }[] = [
  { name: '物理化学', icon: '⚗️' },
  { name: '有機化学', icon: '🧪' },
  { name: '薬理学', icon: '💊' },
  { name: '薬剤学', icon: '📋' },
  { name: '病態・薬物治療', icon: '🏥' },
  { name: '法規・制度', icon: '⚖️' },
  { name: '実務', icon: '👨‍⚕️' },
];

export default function StudyScreen() {
  const { progress } = useApp();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>学習</Text>
        <Text style={styles.subtitle}>カテゴリを選んで問題を解こう</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {categories.map((category) => {
          const categoryProgress = progress.categoryProgress.find(
            (cp) => cp.category === category.name
          );

          return (
            <TouchableOpacity
              key={category.name}
              style={styles.categoryCard}
              onPress={() => router.push(`/quiz/${encodeURIComponent(category.name)}`)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: Colors.categories[category.name] + '20' },
                  ]}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryStatsText}>
                      {categoryProgress?.answeredQuestions || 0} / {categoryProgress?.totalQuestions || 0} 問
                    </Text>
                    <View
                      style={[
                        styles.levelBadge,
                        { backgroundColor: Colors.categories[category.name] },
                      ]}
                    >
                      <Text style={styles.levelBadgeText}>Lv.{categoryProgress?.level || 1}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <ChevronRight color={Colors.textLight} size={24} />
            </TouchableOpacity>
          );
        })}
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
  categoryCard: {
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryInfo: {
    flex: 1,
    gap: 6,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryStatsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
});
