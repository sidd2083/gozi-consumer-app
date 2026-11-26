import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Screen horizontal padding: 12 left + 12 right = 24px.
// 4 columns with 3 gutters of 6px = 18px.
// Exact tile width = Math.floor((SCREEN_WIDTH - 24 - 18) / 4)
const TILE_WIDTH = Math.floor((SCREEN_WIDTH - 42) / 4);

/**
 * Blinkit-Style Category Card:
 * - Generous rounded squircle box (height: 82px, borderRadius: 16)
 * - Displays high-resolution category image from Firestore/Admin Panel
 * - Graceful vector placeholder if image is pending or loading
 * - Bold 2-line category name below the card
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = !!category.imageUrl && !imgFailed;

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={[styles.tileWrapper, { width: TILE_WIDTH }]}
    >
      <View style={styles.imageBox}>
        {hasImage ? (
          <Image
            source={{ uri: category.imageUrl }}
            style={styles.categoryImage}
            resizeMode="contain"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={styles.placeholderCircle}>
              <ShoppingBag size={20} color={colors.brandGreen} strokeWidth={2.4} />
            </View>
          </View>
        )}
      </View>

      <Text numberOfLines={2} style={styles.categoryName}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tileWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  imageBox: {
    width: '100%',
    height: 82,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryImage: {
    width: '90%',
    height: '90%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brandGreenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
    height: 28,
    letterSpacing: -0.2,
  },
});
