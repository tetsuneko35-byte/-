import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Crown,
  Check,
  Sparkles,
  Zap,
  Shield,
  Trophy,
  XCircle,
} from 'lucide-react-native';
import { usePremium, PremiumPlan } from '@/contexts/PremiumContext';
import Colors, { MASCOT_IMAGES } from '@/constants/colors';
import { trpc, trpcClient } from '@/lib/trpc';
import * as WebBrowser from 'expo-web-browser';

interface PlanOption {
  id: PremiumPlan;
  name: string;
  price: string;
  period: string;
  savings?: string;
  popular?: boolean;
  features: string[];
}

const plans: PlanOption[] = [
  {
    id: 'monthly',
    name: '月額プラン',
    price: '¥980',
    period: '/月',
    features: ['広告なし', '全問題アクセス', '詳細な統計', '優先サポート'],
  },
  {
    id: 'yearly',
    name: '年額プラン',
    price: '¥8,800',
    period: '/年',
    savings: '2ヶ月分お得！',
    popular: true,
    features: [
      '広告なし',
      '全問題アクセス',
      '詳細な統計',
      '優先サポート',
      '特別コンテンツ',
    ],
  },
  {
    id: 'lifetime',
    name: '買い切りプラン',
    price: '¥19,800',
    period: '永久',
    savings: '最もお得！',
    features: [
      '広告なし',
      '全問題アクセス',
      '詳細な統計',
      '優先サポート',
      '特別コンテンツ',
      '全ての今後のアップデート',
    ],
  },
];

const premiumFeatures = [
  {
    icon: XCircle,
    title: '広告なし',
    description: '学習に集中できる環境',
  },
  {
    icon: Zap,
    title: '無制限アクセス',
    description: '全ての問題と模擬試験',
  },
  {
    icon: Trophy,
    title: '詳細な統計',
    description: '進捗を細かく分析',
  },
  {
    icon: Shield,
    title: '優先サポート',
    description: '質問に素早く対応',
  },
];

export default function PremiumScreen() {
  const { premiumStatus, isPremium, purchasePlan, cancelSubscription } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan>('yearly');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const createCheckoutMutation = trpc.payment.createCheckoutSession.useMutation();
  
  const handlePaymentSuccess = useCallback(async (sessionId: string) => {
    try {
      const verifyQuery = await trpcClient.payment.verifyPayment.query({ sessionId });
      
      if (verifyQuery.success && verifyQuery.plan) {
        await purchasePlan(verifyQuery.plan, verifyQuery.expiryDate);
        Alert.alert(
          '購入完了！',
          'プレミアムプランへのアップグレードが完了しました。ありがとうございます！',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('エラー', '決済の確認に失敗しました。');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      Alert.alert('エラー', '決済の確認中にエラーが発生しました。');
    } finally {
      setIsPurchasing(false);
    }
  }, [purchasePlan]);

  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      const url = event.url;
      if (url.includes('payment-success')) {
        const urlObj = new URL(url);
        const sessionId = urlObj.searchParams.get('session_id');
        if (sessionId) {
          await handlePaymentSuccess(sessionId);
        }
      } else if (url.includes('payment-cancel')) {
        Alert.alert('キャンセル', '決済がキャンセルされました。');
        setIsPurchasing(false);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, [handlePaymentSuccess]);

  const handlePurchase = async () => {
    if (Platform.OS !== 'web') {
      setIsPurchasing(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const success = await purchasePlan(selectedPlan);
        
        if (success) {
          Alert.alert(
            '購入完了！',
            'プレミアムプランへのアップグレードが完了しました。ありがとうございます！',
            [{ text: 'OK' }]
          );
        }
      } catch {
        Alert.alert('エラー', '購入に失敗しました。もう一度お試しください。');
      } finally {
        setIsPurchasing(false);
      }
      return;
    }

    if (selectedPlan === 'free') {
      Alert.alert('エラー', '有効なプランを選択してください。');
      return;
    }

    setIsPurchasing(true);
    try {
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const result = await createCheckoutMutation.mutateAsync({
        plan: selectedPlan as 'monthly' | 'yearly' | 'lifetime',
        successUrl: `${currentUrl}/premium?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${currentUrl}/premium?payment=cancel`,
      });

      if (result.url) {
        if (typeof window !== 'undefined') {
          window.location.href = result.url;
        } else {
          await WebBrowser.openBrowserAsync(result.url);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('エラー', '決済ページの作成に失敗しました。もう一度お試しください。');
      setIsPurchasing(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'サブスクリプションのキャンセル',
      '本当にキャンセルしますか？プレミアム機能が利用できなくなります。',
      [
        { text: 'いいえ', style: 'cancel' },
        {
          text: 'はい',
          style: 'destructive',
          onPress: async () => {
            await cancelSubscription();
            Alert.alert('キャンセル完了', 'サブスクリプションをキャンセルしました。');
          },
        },
      ]
    );
  };

  if (isPremium) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.premiumHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.premiumHeaderContent}>
              <Crown color="#FFF" size={48} />
              <Text style={styles.premiumTitle}>プレミアム会員</Text>
              <Text style={styles.premiumSubtitle}>
                プレミアムプランをご利用中です
              </Text>
              <Image
                source={{ uri: MASCOT_IMAGES.happy }}
                style={styles.mascotImageLarge}
              />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>プラン</Text>
              <Text style={styles.statusValue}>
                {premiumStatus.plan === 'monthly' && '月額プラン'}
                {premiumStatus.plan === 'yearly' && '年額プラン'}
                {premiumStatus.plan === 'lifetime' && '買い切りプラン'}
              </Text>
            </View>
            {premiumStatus.expiryDate && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>有効期限</Text>
                <Text style={styles.statusValue}>
                  {new Date(premiumStatus.expiryDate).toLocaleDateString('ja-JP')}
                </Text>
              </View>
            )}
            {premiumStatus.purchaseDate && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>購入日</Text>
                <Text style={styles.statusValue}>
                  {new Date(premiumStatus.purchaseDate).toLocaleDateString('ja-JP')}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>プレミアム特典</Text>
            {premiumFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View key={index} style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Icon color={Colors.primary} size={24} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
                  </View>
                  <Check color={Colors.success} size={24} />
                </View>
              );
            })}
          </View>

          {premiumStatus.plan !== 'lifetime' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>
                サブスクリプションをキャンセル
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#FFD700', '#FFA500']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Sparkles color="#FFF" size={40} />
            <Text style={styles.title}>プレミアムプラン</Text>
            <Text style={styles.subtitle}>
              広告なしで快適に学習しましょう
            </Text>
            <Image
              source={{ uri: MASCOT_IMAGES.thinking }}
              style={styles.mascotImage}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>プレミアム特典</Text>
          <View style={styles.featuresGrid}>
            {premiumFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View key={index} style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Icon color={Colors.primary} size={24} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>プランを選択</Text>
          <View style={styles.plansContainer}>
            {plans.map(plan => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                  plan.popular && styles.planCardPopular,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.7}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Crown color="#FFF" size={16} />
                    <Text style={styles.popularText}>人気</Text>
                  </View>
                )}
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{plan.savings}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.planPricing}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
                <View style={styles.planFeatures}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.planFeature}>
                      <Check color={Colors.success} size={16} />
                      <Text style={styles.planFeatureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                {selectedPlan === plan.id && (
                  <View style={styles.selectedIndicator}>
                    <Check color="#FFF" size={20} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.purchaseButton, isPurchasing && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={isPurchasing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.purchaseGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Crown color="#FFF" size={24} />
            <Text style={styles.purchaseButtonText}>
              {isPurchasing ? '処理中...' : 'プレミアムにアップグレード'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {Platform.OS !== 'web' && (
          <Text style={styles.disclaimer}>
            ※ モバイルアプリではデモモードです。Web版で実際の決済が可能です。
          </Text>
        )}
        {Platform.OS === 'web' && (
          <Text style={styles.disclaimer}>
            ※ テスト環境です。実際の課金を行うにはStripe APIキーの設定が必要です。
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  premiumHeader: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  premiumHeaderContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#FFF',
    marginTop: 16,
    textAlign: 'center',
  },
  premiumTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#FFF',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  premiumSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  mascotImage: {
    width: 120,
    height: 120,
    marginTop: 20,
  },
  mascotImageLarge: {
    width: 150,
    height: 150,
    marginTop: 24,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: Colors.cardBg,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
  },
  planCardPopular: {
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
  planHeader: {
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  savingsBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  planPeriod: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  planFeatures: {
    gap: 8,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic' as const,
  },
  statusCard: {
    backgroundColor: Colors.cardBg,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEE',
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
});
