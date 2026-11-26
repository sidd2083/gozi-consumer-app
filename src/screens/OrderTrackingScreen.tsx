import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  Phone,
  Clock,
  CheckCircle2,
  Package,
  Bike,
  Home,
  MapPin,
  RefreshCw,
} from 'lucide-react-native';
import { colors } from '../constants/theme';
import { subscribeOrder } from '../services/dataService';
import { Order, OrderStatus } from '../types';

interface OrderTrackingScreenProps {
  orderId: string;
  onBackToHome: () => void;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  orderId,
  onBackToHome,
}) => {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const unsub = subscribeOrder(orderId, (liveOrder) => {
      setOrder(liveOrder);
    });
    return () => unsub();
  }, [orderId]);

  const handleCallRider = () => {
    if (order?.riderDetails?.phone) {
      Linking.openURL(`tel:${order.riderDetails.phone}`);
    }
  };

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Fetching live order status...</Text>
      </View>
    );
  }

  // Status mapping
  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'packing':
        return 1;
      case 'handover':
        return 2;
      case 'reached':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = getStatusStepIndex(order.status);

  const statusDescriptions = {
    placed: {
      title: 'Order Received',
      sub: 'Waiting for Kathmandu dark store team to accept & pack',
    },
    packing: {
      title: 'Packing Your Order',
      sub: 'Store pickers are carefully bagging your fresh items',
    },
    handover: {
      title: 'Out for Delivery',
      sub: 'Rider is on the way to your delivery address',
    },
    reached: {
      title: 'Rider Reached Your Gate',
      sub: 'Please be ready to receive your order and pay cash',
    },
    delivered: {
      title: 'Delivered Successfully',
      sub: 'Enjoy your fresh daily essentials from Gozi!',
    },
    cancelled: {
      title: 'Order Cancelled',
      sub: 'This order was cancelled by the store',
    },
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} onPress={onBackToHome} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
          <Text style={styles.headerSubtitle}>Live 10-Minute Dark Store Sync</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Interactive Live Route Map Visualizer */}
        <View style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            {/* Visualizer Route Representation */}
            <View style={styles.routeBox}>
              <View style={styles.storePin}>
                <Package size={14} color="#FFFFFF" />
              </View>
              <View style={styles.routeLine} />
              <View
                style={[
                  styles.riderPin,
                  {
                    left:
                      currentStep === 0
                        ? '10%'
                        : currentStep === 1
                        ? '25%'
                        : currentStep === 2
                        ? '55%'
                        : currentStep === 3
                        ? '88%'
                        : '95%',
                  },
                ]}
              >
                <Bike size={14} color="#FFFFFF" />
              </View>
              <View style={styles.customerPin}>
                <Home size={14} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.mapLabelsRow}>
              <Text style={styles.mapStoreLabel}>Dark Store (Lazimpat)</Text>
              <Text style={styles.mapCustomerLabel}>Your Doorstep</Text>
            </View>
          </View>
        </View>

        {/* Live Status Hero Box */}
        <View style={styles.statusHeroBox}>
          <View style={styles.statusHeaderRow}>
            <View>
              <Text style={styles.statusTitle}>
                {statusDescriptions[order.status]?.title || 'Order Update'}
              </Text>
              <Text style={styles.statusSub}>
                {statusDescriptions[order.status]?.sub}
              </Text>
            </View>

            <View style={styles.timerBadge}>
              <Clock size={14} color={colors.brandGreenDark} />
              <Text style={styles.timerText}>
                {order.status === 'delivered' ? 'ARRIVED' : '10 MINS'}
              </Text>
            </View>
          </View>

          {/* Stepper Progress Bar */}
          <View style={styles.progressBarWrapper}>
            {['Placed', 'Packing', 'On Way', 'Reached', 'Delivered'].map((step, idx) => {
              const isCompleted = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <View key={step} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isCompleted && styles.stepCircleCompleted,
                      isCurrent && styles.stepCircleActive,
                    ]}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={12} color="#FFFFFF" strokeWidth={3} />
                    ) : (
                      <View style={styles.stepDot} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepText,
                      isCompleted && styles.stepTextCompleted,
                    ]}
                  >
                    {step}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Rider Contact Card (Visible once assigned) */}
        {order.riderDetails && (
          <View style={styles.riderCard}>
            <Image
              source={{ uri: order.riderDetails.photoUrl }}
              style={styles.riderPhoto}
            />
            <View style={styles.riderMeta}>
              <Text style={styles.riderRoleLabel}>YOUR DELIVERY PARTNER</Text>
              <Text style={styles.riderName}>{order.riderDetails.name}</Text>
              <Text style={styles.riderSub}>Gozi Verified Electric Fleet</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.callRiderBtn}
              onPress={handleCallRider}
            >
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.callRiderText}>Call</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delivery Doorstep Pin Info */}
        <View style={styles.detailCard}>
          <Text style={styles.detailHeader}>Delivering to Doorstep</Text>
          <View style={styles.addressMetaRow}>
            <MapPin size={16} color={colors.primary} />
            <Text numberOfLines={2} style={styles.addressText}>
              {order.deliveryAddress?.fullAddress || order.address?.fullAddress || 'Delivery Address'}
              {order.deliveryAddress?.landmark ? ` (${order.deliveryAddress.landmark})` : ''}
            </Text>
          </View>
        </View>

        {/* Order Items & Receipt */}
        <View style={styles.detailCard}>
          <Text style={styles.detailHeader}>Order Receipt</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.receiptRow}>
              <Text style={styles.receiptQty}>{item.qty}x</Text>
              <Text numberOfLines={1} style={styles.receiptName}>
                {item.name} ({item.unit})
              </Text>
              <Text style={styles.receiptPrice}>Rs. {item.price * item.qty}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.receiptRow}>
            <Text style={styles.billSubLabel}>Payment Method</Text>
            <Text style={styles.codBadge}>Cash on Delivery (COD)</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.billTotalLabel}>Grand Total</Text>
            <Text style={styles.billTotalVal}>Rs. {order.bill.grandTotal}</Text>
          </View>
        </View>

        {/* Back To Home CTA */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.homeBtn}
          onPress={onBackToHome}
        >
          <Text style={styles.homeBtnText}>Back to Home Store</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  scrollContent: {
    padding: 14,
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  mapPlaceholder: {
    height: 140,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  routeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 40,
  },
  storePin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  routeLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 4,
    backgroundColor: '#93C5FD',
    borderRadius: 2,
  },
  riderPin: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  customerPin: {
    position: 'absolute',
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  mapLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  mapStoreLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  mapCustomerLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  statusHeroBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statusSub: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
    maxWidth: 210,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brandGreenDark,
  },
  progressBarWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: colors.primary,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  stepText: {
    fontSize: 9.5,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
  stepTextCompleted: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  riderPhoto: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F3F4F6',
  },
  riderMeta: {
    flex: 1,
    marginLeft: 12,
  },
  riderRoleLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  riderName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 1,
  },
  riderSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  callRiderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  callRiderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  detailHeader: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  addressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressText: {
    fontSize: 12.5,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  receiptQty: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    width: 24,
  },
  receiptName: {
    fontSize: 12.5,
    color: colors.textPrimary,
    flex: 1,
  },
  receiptPrice: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  billSubLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  codBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  billTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  billTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  homeBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  homeBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});
