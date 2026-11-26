import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Clock,
  ShieldCheck,
  Banknote,
  MapPin,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import { placeOrder } from '../services/dataService';

interface CartScreenProps {
  onBack: () => void;
  onOrderPlaced: (orderId: string) => void;
  onOpenAddressSelector: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onBack,
  onOrderPlaced,
  onOpenAddressSelector,
}) => {
  const { items, itemTotal, totalItems, addToCart, removeFromCart, clearCart } = useCart();
  const { user, activeAddress, appConfig } = useApp();
  const [placingOrder, setPlacingOrder] = useState(false);

  // Delivery fee dynamically from Firestore settings/appConfig
  const deliveryFee = appConfig.deliveryFee;
  const grandTotal = itemTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!activeAddress) {
      Alert.alert('Delivery Address Required', 'Please select or add a delivery address to proceed.');
      return;
    }

    try {
      setPlacingOrder(true);

      const orderNumber = 'GZ-' + Math.floor(100000 + Math.random() * 900000);
      const newOrderId = await placeOrder({
        orderNumber,
        userId: user?.uid || 'guest-user',
        customerName: user?.name || 'Gozi Customer',
        customerPhone: user?.phone || '+977 9800000000',
        deliveryAddress: {
          fullAddress: activeAddress.fullAddress,
          landmark: activeAddress.landmark,
          lat: activeAddress.lat,
          lng: activeAddress.lng,
        },
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          unit: i.product.unit,
          price: i.product.sellingPrice,
          qty: i.quantity,
          imageUrl: i.product.images[0],
        })),
        bill: {
          itemTotal,
          deliveryFee,
          grandTotal,
        },
        paymentMethod: 'COD',
        status: 'placed',
        riderId: null,
        riderDetails: null,
        storeId: 'store-hetauda-main',
      });

      // Clear the cart upon successful placement
      clearCart();
      setPlacingOrder(false);
      onOrderPlaced(newOrderId);
    } catch (error) {
      setPlacingOrder(false);
      Alert.alert('Order Error', 'Failed to place order. Please try again.');
      console.error(error);
    }
  };

  if (totalItems === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>

        <View style={styles.emptyCenter}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>
            Explore thousands of grocery items delivered in 10 minutes.
          </Text>
          <TouchableOpacity activeOpacity={0.85} style={styles.browseButton} onPress={onBack}>
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Checkout</Text>
            <Text style={styles.headerSubtitle}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Delivery Guarantee Pill */}
        <View style={styles.deliveryBadgeBox}>
          <Clock size={16} color={colors.brandGreenDark} />
          <Text style={styles.deliveryBadgeText}>
            Delivery in {appConfig.estimatedMinutes} minutes to your doorstep
          </Text>
        </View>

        {/* Cart Items List */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Review Items</Text>
          {items.map(({ product, quantity }) => (
            <View key={product.id} style={styles.itemRow}>
              <Image
                source={{ uri: product.images[0] }}
                style={styles.itemImage}
                resizeMode="contain"
              />
              <View style={styles.itemMeta}>
                <Text numberOfLines={1} style={styles.itemName}>
                  {product.name}
                </Text>
                <Text style={styles.itemUnit}>{product.unit}</Text>
                <Text style={styles.itemPrice}>
                  Rs. {product.sellingPrice * quantity}
                </Text>
              </View>

              {/* Stepper */}
              <View style={styles.itemStepper}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.stepperSubBtn}
                  onPress={() => removeFromCart(product.id)}
                >
                  <Minus size={14} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>

                <Text style={styles.stepperCountText}>{quantity}</Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.stepperSubBtn}
                  onPress={() => addToCart(product)}
                >
                  <Plus size={14} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Address Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.card}
          onPress={onOpenAddressSelector}
        >
          <View style={styles.addressHeaderRow}>
            <View style={styles.addressTitleLeft}>
              <MapPin size={17} color={colors.primary} />
              <Text style={styles.cardHeader}>Delivering to</Text>
            </View>
            <View style={styles.changeAddressRight}>
              <Text style={styles.changeAddressText}>Change</Text>
              <ChevronRight size={14} color={colors.primary} />
            </View>
          </View>

          <View style={styles.addressDetails}>
            <Text style={styles.addressLabel}>{activeAddress?.label || 'Home'}</Text>
            <Text numberOfLines={2} style={styles.addressFull}>
              {activeAddress
                ? `${activeAddress.fullAddress} (${activeAddress.landmark})`
                : 'Tap to select delivery location'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bill Summary */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Bill Details</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billVal}>Rs. {itemTotal}</Text>
          </View>

          <View style={styles.billRow}>
            <View style={styles.deliveryFeeRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              {deliveryFee === 0 && (
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              )}
            </View>
            <Text style={[styles.billVal, deliveryFee === 0 && styles.freePriceText]}>
              {deliveryFee === 0 ? 'Rs. 0' : `Rs. ${deliveryFee}`}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.billRowTotal}>
            <Text style={styles.totalLabel}>To Pay</Text>
            <Text style={styles.totalVal}>Rs. {grandTotal}</Text>
          </View>
        </View>

        {/* Payment Mode: Cash on Delivery (COD) Only */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Payment Option</Text>
          <View style={styles.paymentBox}>
            <View style={styles.paymentIconBox}>
              <Banknote size={20} color={colors.brandGreen} />
            </View>
            <View style={styles.paymentMeta}>
              <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentSub}>
                Pay cash at your doorstep when your order arrives
              </Text>
            </View>
            <View style={styles.codRadioOuter}>
              <View style={styles.codRadioInner} />
            </View>
          </View>
        </View>

        {/* Cancellation Policy Assurance */}
        <View style={styles.policyRow}>
          <ShieldCheck size={16} color={colors.textSecondary} />
          <Text style={styles.policyText}>
            100% contactless doorstep delivery • Freshness guaranteed
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Place Order CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPayLabel}>PAY USING CASH</Text>
          <Text style={styles.bottomPayVal}>Rs. {grandTotal}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          disabled={placingOrder}
          style={[styles.placeOrderButton, placingOrder && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
        >
          {placingOrder ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.placeOrderButtonText}>
              Place Order • Rs. {grandTotal}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  scrollContent: {
    padding: 14,
  },
  deliveryBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandGreenLight,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 12,
  },
  deliveryBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.brandGreenDark,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  cardHeader: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  itemMeta: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemUnit: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  itemStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 28,
    paddingHorizontal: 4,
  },
  stepperSubBtn: {
    width: 22,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 6,
    fontVariant: ['tabular-nums'],
  },
  addressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  addressTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeAddressRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeAddressText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  addressDetails: {
    marginTop: 2,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  addressFull: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  deliveryFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  freeBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#15803D',
  },
  freePriceText: {
    color: '#15803D',
    fontWeight: '800',
  },
  billLabel: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  billVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  billRowTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  totalLabel: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  totalVal: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  paymentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMeta: {
    flex: 1,
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  paymentSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  codRadioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  policyText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPayLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  bottomPayVal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  placeOrderButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  placeOrderButtonDisabled: {
    opacity: 0.7,
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
