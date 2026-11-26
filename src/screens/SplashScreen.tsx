import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { GoziLogo } from '../components/GoziLogo';
import { colors } from '../constants/theme';

interface SplashScreenProps {
  onFinish: () => void;
}

/**
 * Splash Screen:
 * Clean, smooth entrance displaying circular Gozii logo and Gozii title with
 * subtle motion, then transitioning cleanly into onboarding/home.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // Subtle entrance animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(titleAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 1300);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <GoziLogo size={120} />
        <Animated.View style={{ transform: [{ translateY: titleAnim }] }}>
          <Text style={styles.brandTitle}>Gozii</Text>
          <Text style={styles.tagline}>Everything delivered in 10 mins</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    alignItems: 'center',
  },
  brandTitle: {
    marginTop: 18,
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.88)',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
