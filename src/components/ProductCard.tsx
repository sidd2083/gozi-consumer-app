import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { colors } from '../constants/theme';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  width?: number | string;
}

/**
 * Zepto/Blinkit Product Card:
 * - Crisp white card with soft shadow
 * - Flat % OFF tag
 * - 2-line title
 * - Green ADD button morphing into - 1 + stepper with haptic feedback
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, width = 152 }) => {
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
        { width: typeof width === 'number' ? width : undefined },
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

      {/* Pack Size Pill */}
      <View style={styles.unitPill}>
        <Text style={styles.unitText}>{product.unit}</Text>
      </View>

      {/* Product Title */}
      <Text numberOfLines={2} style={styles.title}>
        {product.name}
      </Text>

      {/* Bottom Action Row */}
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
            <Text style={styles.outOfStockText}>Out of Stock</Text>
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
              <Minus size={13} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>

            <Text style={styles.stepperCount}>{quantity}</Text>

            <TouchableOpacity
              activeOpacity={0.65}
              style={styles.stepperButton}
              onPress={handleAdd}
            >
              <Plus size={13} color="#FFFFFF" strokeWidth={3} />
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    padding: 8,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardOutOfStock: {
    opacity: 0.6,
  },
  imageContainer: {
    height: 108,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '88%',
    height: '88%',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  unitPill: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unitText: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 16,
    marginTop: 4,
    height: 32,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  sellingPrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  mrpPrice: {
    fontSize: 10.5,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
    marginTop: 1,
  },
  addButton: {
    minWidth: 52,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.brandGreen,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  addButtonText: {
    color: colors.brandGreen,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandGreen,
    borderRadius: 6,
    height: 28,
    paddingHorizontal: 4,
  },
  stepperButton: {
    width: 20,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 6,
    fontVariant: ['tabular-nums'],
  },
  outOfStockBadge: {
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  outOfStockText: {
    fontSize: 10.5,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
