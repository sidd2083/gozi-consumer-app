import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Zap, Package } from 'lucide-react-native';
import { colors } from '../constants/theme';

interface SmartLoaderProps {
  loading: boolean;
  delayMs?: number;
  message?: string;
}

/**
 * Smart Loading State (Blinkit / Zepto inspired):
 * - If request takes < 250ms, does NOT render any loading disturbance.
 * - Only when a request actually takes noticeable time (>250ms), shows a clean,
 *   smooth vector animation with "Everything at your doorstep in 10 mins".
 * - ZERO emojis.
 */
export const SmartLoader: React.FC<SmartLoaderProps> = ({
  loading,
  delayMs = 250,
  message = 'Everything at your doorstep in 10 mins',
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (loading) {
      timer = setTimeout(() => {
        setShouldShow(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();

        // Loop subtle pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.12,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delayMs);
    } else {
      setShouldShow(false);
      fadeAnim.setValue(0);
      pulseAnim.setValue(1);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, delayMs]);

  if (!shouldShow) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.iconCircle}>
            <Zap size={22} color={colors.brandGreen} strokeWidth={2.8} />
          </View>
        </Animated.View>
        <Text style={styles.messageText}>{message}</Text>
        <Text style={styles.subText}>Gozii Quick Commerce</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  card: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.brandGreenLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.brandGreen,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: colors.brandGreenDark,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
