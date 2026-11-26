import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { colors } from '../constants/theme';

interface ProductCard3ColProps {
  product: Product;
  onPress?: () => void;
  width?: number;
}

/**
 * 3-In-A-Row Compact Product Card (Blinkit / Zepto inspired):
 * - Strict 3 cards per row with zero horizontal scrolling
 * - Clean white card with subtle border and elevation
 * - Product image with discount % badge
 * - Pack size unit, 2-line title, and price in Rs.
 * - Direct ADD button / - 1 + stepper with haptics
 */
export const ProductCard3Col: React.FC<ProductCard3ColProps> = ({
  product,
  onPress,
  width = 110,
}) => {
  const { getItemQuantity, addToCart, removeFromCart } = useCart();
  const quantity = getItemQuantity(product.id);
  const hasDiscount = product.mrp > product.sellingPrice;

  const handleAdd = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    addToCart(product);
  };

  const handleRemove = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    removeFromCart(product.id);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        { width },
        !product.inStock && styles.cardOutOfStock,
      ]}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="contain"
        />

        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {product.discountPercent}% OFF
            </Text>
          </View>
        )}
      </View>

      {/* Pack Size Unit */}
      <Text numberOfLines={1} style={styles.unitText}>
        {product.unit}
      </Text>

      {/* 2-line Title */}
      <Text numberOfLines={2} style={styles.title}>
        {product.name}
      </Text>

      {/* Price & Action Row */}
      <View style={styles.bottomRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.sellingPrice}>
            Rs. {product.sellingPrice}
          </Text>
          {hasDiscount && (
            <Text style={styles.mrpPrice}>
              Rs. {product.mrp}
            </Text>
          )}
        </View>

        {!product.inStock ? (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out</Text>
          </View>
        ) : quantity === 0 ? (
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.addButton}
            onPress={handleAdd}
          >
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              activeOpacity={0.65}
              style={styles.stepperButton}
              onPress={handleRemove}
            >
              <Minus size={11} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>

            <Text style={styles.stepperCount}>{quantity}</Text>

            <TouchableOpacity
              activeOpacity={0.65}
              style={styles.stepperButton}
              onPress={handleAdd}
            >
              <Plus size={11} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 6,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  cardOutOfStock: {
    opacity: 0.6,
  },
  imageContainer: {
    height: 80,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '85%',
    height: '85%',
  },
  discountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: colors.discountBlue,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  unitText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 5,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 14,
    marginTop: 2,
    height: 28,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceContainer: {
    flex: 1,
    marginRight: 4,
  },
  sellingPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  mrpPrice: {
    fontSize: 9,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
  },
  addButton: {
    minWidth: 42,
    height: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.brandGreen,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  addButtonText: {
    color: colors.brandGreen,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandGreen,
    borderRadius: 6,
    height: 26,
    paddingHorizontal: 2,
  },
  stepperButton: {
    width: 18,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 3,
  },
  outOfStockBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  outOfStockText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
});
