import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Screen padding: 14 on left and right = 28. Available width = SCREEN_WIDTH - 28.
// 4 items with 3 gaps of 8px = 24px gap. Item width = (SCREEN_WIDTH - 28 - 24) / 4.
const ITEM_WIDTH = Math.floor((SCREEN_WIDTH - 52) / 4);

/**
 * Category Card with 0 clipping and soft white-shaded surface
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={[styles.container, { width: ITEM_WIDTH }]}
    >
      <View style={styles.imageBox}>
        <Image
          source={{ uri: category.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <Text numberOfLines={2} style={styles.title}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 14,
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: '88%',
    height: '88%',
    borderRadius: 10,
  },
  title: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 14,
    height: 28,
  },
});
