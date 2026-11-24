import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Search } from 'lucide-react-native';
import { colors } from '../constants/theme';

interface AnimatedSearchBarProps {
  onPress: () => void;
  keywords?: string[];
}

const DEFAULT_KEYWORDS = [
  'Milk',
  'Chocolate',
  'Fresh Bananas',
  'Brown Eggs',
  'Atta & Rice',
  'Cold Drinks',
  'Biscuits & Cookies',
];

export const AnimatedSearchBar: React.FC<AnimatedSearchBarProps> = ({
  onPress,
  keywords = DEFAULT_KEYWORDS,
}) => {
  const [index, setIndex] = useState(0);
  const [translateY] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(1));

  useEffect(() => {
    const interval = setInterval(() => {
      // Animate up and fade out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -16,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIndex((prev) => (prev + 1) % keywords.length);
        translateY.setValue(16);
        // Animate up from bottom and fade in
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [keywords]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}
    >
      <Search size={19} color={colors.textSecondary} strokeWidth={2.2} />

      <View style={styles.textWrapper}>
        <Text style={styles.prefixText}>Search for </Text>
        <Animated.View
          style={{
            transform: [{ translateY }],
            opacity,
          }}
        >
          <Text style={styles.keywordText}>"{keywords[index]}"</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  textWrapper: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    height: 24,
  },
  prefixText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  keywordText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
