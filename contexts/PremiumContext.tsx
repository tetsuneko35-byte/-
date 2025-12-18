import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';


const PREMIUM_STORAGE_KEY = '@pharmacy_app_premium';

export type PremiumPlan = 'free' | 'monthly' | 'yearly' | 'lifetime';

export interface PremiumStatus {
  plan: PremiumPlan;
  expiryDate: string | null;
  purchaseDate: string | null;
}

const getInitialPremiumStatus = (): PremiumStatus => ({
  plan: 'free',
  expiryDate: null,
  purchaseDate: null,
});

export const [PremiumProvider, usePremium] = createContextHook(() => {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>(
    getInitialPremiumStatus()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
      if (stored) {
        const data: PremiumStatus = JSON.parse(stored);
        
        if (data.plan !== 'free' && data.plan !== 'lifetime' && data.expiryDate) {
          const expiry = new Date(data.expiryDate);
          const now = new Date();
          
          if (now > expiry) {
            const expired = getInitialPremiumStatus();
            setPremiumStatus(expired);
            await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(expired));
            return;
          }
        }
        
        setPremiumStatus(data);
      }
    } catch (error) {
      console.error('Failed to load premium status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePremiumStatus = async (status: PremiumStatus) => {
    try {
      await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Failed to save premium status:', error);
    }
  };

  const purchasePlan = useCallback(
    async (plan: PremiumPlan, expiryDateOverride?: string | null) => {
      const now = new Date();
      let expiryDate: string | null = null;

      if (expiryDateOverride !== undefined) {
        expiryDate = expiryDateOverride;
      } else if (plan === 'monthly') {
        const expiry = new Date(now);
        expiry.setMonth(expiry.getMonth() + 1);
        expiryDate = expiry.toISOString();
      } else if (plan === 'yearly') {
        const expiry = new Date(now);
        expiry.setFullYear(expiry.getFullYear() + 1);
        expiryDate = expiry.toISOString();
      }

      const newStatus: PremiumStatus = {
        plan,
        expiryDate,
        purchaseDate: now.toISOString(),
      };

      setPremiumStatus(newStatus);
      await savePremiumStatus(newStatus);
      
      return true;
    },
    []
  );

  const cancelSubscription = useCallback(async () => {
    const canceledStatus = getInitialPremiumStatus();
    setPremiumStatus(canceledStatus);
    await savePremiumStatus(canceledStatus);
  }, []);

  const isPremium = premiumStatus.plan !== 'free';

  return {
    premiumStatus,
    isPremium,
    isLoading,
    purchasePlan,
    cancelSubscription,
  };
});
