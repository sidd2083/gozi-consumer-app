import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../constants/theme';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Screen horizontal padding: 14 left + 14 right = 28px.
// 4 items per row with 3 gutters of 6px = 18px.
// Exact tile width = Math.floor((SCREEN_WIDTH - 28 - 18) / 4)
const TILE_WIDTH = Math.floor((SCREEN_WIDTH - 46) / 4);

/**
 * 4 Categories Per Row (TEXT ONLY - No Images Yet)
 * Renders category names inside clean, subtle cards/tiles fitting exactly 4 per row
 * with zero clipping, ready for images in future phases.
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={[styles.tileBox, { width: TILE_WIDTH }]}
    >
      <View style={styles.innerContent}>
        <Text numberOfLines={2} style={styles.categoryName}>
          {category.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tileBox: {
    height: 54,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    paddingVertical: 6,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  innerContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
    letterSpacing: -0.2,
  },
});
