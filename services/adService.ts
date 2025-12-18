import { Platform } from 'react-native';

class AdService {
  private interstitialLoaded = false;
  private rewardedLoaded = false;

  async initialize() {
    if (Platform.OS === 'web') {
      console.log('[Ad] Ads not available on web');
      return;
    }
    
    console.log('[Ad] Ad service initialized');
  }

  async loadInterstitial() {
    if (Platform.OS === 'web') return;
    
    try {
      console.log('[Ad] Loading interstitial ad...');
      this.interstitialLoaded = true;
    } catch (error) {
      console.error('[Ad] Failed to load interstitial:', error);
      this.interstitialLoaded = false;
    }
  }

  async showInterstitial(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    if (!this.interstitialLoaded) {
      console.log('[Ad] Interstitial not loaded');
      return false;
    }

    try {
      console.log('[Ad] Showing interstitial ad');
      this.interstitialLoaded = false;
      this.loadInterstitial();
      return true;
    } catch (error) {
      console.error('[Ad] Failed to show interstitial:', error);
      return false;
    }
  }

  async loadRewarded() {
    if (Platform.OS === 'web') return;
    
    try {
      console.log('[Ad] Loading rewarded ad...');
      this.rewardedLoaded = true;
    } catch (error) {
      console.error('[Ad] Failed to load rewarded:', error);
      this.rewardedLoaded = false;
    }
  }

  async showRewarded(): Promise<{ watched: boolean; earned: boolean }> {
    if (Platform.OS === 'web') {
      return { watched: false, earned: false };
    }
    
    if (!this.rewardedLoaded) {
      console.log('[Ad] Rewarded ad not loaded');
      return { watched: false, earned: false };
    }

    try {
      console.log('[Ad] Showing rewarded ad');
      this.rewardedLoaded = false;
      this.loadRewarded();
      return { watched: true, earned: true };
    } catch (error) {
      console.error('[Ad] Failed to show rewarded:', error);
      return { watched: false, earned: false };
    }
  }

  isRewardedReady(): boolean {
    return this.rewardedLoaded;
  }
}

export default new AdService();
