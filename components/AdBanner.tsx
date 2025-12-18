import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Colors from '@/constants/colors';

interface AdBannerProps {
  size?: 'banner' | 'large';
}

export default function AdBanner({ size = 'banner' }: AdBannerProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, size === 'large' && styles.largeContainer]}>
        <Text style={styles.placeholderText}>広告スペース</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, size === 'large' && styles.largeContainer]}>
      <Text style={styles.placeholderText}>広告</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    borderRadius: 8,
  },
  largeContainer: {
    height: 100,
  },
  placeholderText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
