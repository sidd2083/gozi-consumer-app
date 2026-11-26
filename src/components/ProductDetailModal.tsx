import React from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { X, Minus, Plus, ShieldCheck, Clock } from 'lucide-react-native';
import { Product } from '../types';
import { colors } from '../constants/theme';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  visible,
  onClose,
}) => {
  if (!product) return null;

  const { getItemQuantity, addToCart, removeFromCart } = useCart();
  const quantity = getItemQuantity(product.id);
  const hasDiscount = product.mrp > product.sellingPrice;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Header Bar */}
          <View style={styles.sheetHeader}>
            <View style={styles.handleBar} />
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Gallery Image */}
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: product.images[0] }}
                style={styles.productImage}
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

            {/* Pack Size & Delivery Banner */}
            <View style={styles.badgeRow}>
              <View style={styles.unitBadge}>
                <Text style={styles.unitText}>{product.unit}</Text>
              </View>
              <View style={styles.fastDeliveryBadge}>
                <Clock size={12} color={colors.brandGreenDark} />
                <Text style={styles.fastDeliveryText}>QUICK DELIVERY</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>{product.name}</Text>

            {/* Pricing Breakdown */}
            <View style={styles.priceRow}>
              <Text style={styles.sellingPrice}>Rs. {product.sellingPrice}</Text>
              {hasDiscount && (
                <Text style={styles.mrpPrice}>MRP Rs. {product.mrp}</Text>
              )}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Product Description */}
            <Text style={styles.sectionHeading}>Product Details</Text>
            <Text style={styles.description}>{product.description}</Text>

            {/* Trust Assurances */}
            <View style={styles.assuranceBox}>
              <ShieldCheck size={18} color={colors.brandGreen} />
              <Text style={styles.assuranceText}>
                100% Quality Inspected Dark Store Stock • Direct Replacements
              </Text>
            </View>
          </ScrollView>

          {/* Sticky Bottom Add / Stepper CTA */}
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomPriceLabel}>Total Price</Text>
              <Text style={styles.bottomPriceVal}>
                Rs. {product.sellingPrice * (quantity > 0 ? quantity : 1)}
              </Text>
            </View>

            {!product.inStock ? (
              <View style={styles.outOfStockBox}>
                <Text style={styles.outOfStockText}>Currently Out of Stock</Text>
              </View>
            ) : quantity === 0 ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.actionAddButton}
                onPress={() => addToCart(product)}
              >
                <Text style={styles.actionAddText}>Add to Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionStepper}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.stepperSubBtn}
                  onPress={() => removeFromCart(product.id)}
                >
                  <Minus size={18} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>

                <Text style={styles.stepperSubCount}>{quantity}</Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.stepperSubBtn}
                  onPress={() => addToCart(product)}
                >
                  <Plus size={18} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.82,
    paddingBottom: 20,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    position: 'relative',
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  imageWrapper: {
    height: 220,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    position: 'relative',
  },
  productImage: {
    width: '80%',
    height: '80%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.discountBlue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  unitBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  fastDeliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandGreenLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  fastDeliveryText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brandGreenDark,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
    lineHeight: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    gap: 10,
  },
  sellingPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  mrpPrice: {
    fontSize: 14,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 18,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  description: {
    fontSize: 13.5,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  assuranceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandGreenLight,
    padding: 12,
    borderRadius: 10,
    marginTop: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.brandGreenLight,
  },
  assuranceText: {
    fontSize: 12,
    color: colors.brandGreenDark,
    fontWeight: '600',
    flex: 1,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingTop: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  bottomPriceVal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  actionAddButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionAddText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  actionStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    height: 42,
  },
  stepperSubBtn: {
    width: 32,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSubCount: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 12,
    fontVariant: ['tabular-nums'],
  },
  outOfStockBox: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  outOfStockText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
});
