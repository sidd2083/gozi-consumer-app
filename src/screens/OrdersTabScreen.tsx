import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { Clock, RotateCcw, ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { subscribeUserOrders } from '../services/dataService';
import { Order } from '../types';

interface OrdersTabScreenProps {
  onNavigateToTracking: (orderId: string) => void;
  onExploreProducts: () => void;
}

export const OrdersTabScreen: React.FC<OrdersTabScreenProps> = ({
  onNavigateToTracking,
  onExploreProducts,
}) => {
  const { user } = useApp();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user?.uid) {
      const unsub = subscribeUserOrders(user.uid, (list) => {
        setOrders(list);
      });
      return () => unsub();
    }
  }, [user?.uid]);

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart({
        id: item.productId,
        name: item.name,
        description: '',
        categoryId: 'cat-rice-grains',
        department: 'Grocery & Kitchen',
        unit: item.unit,
        mrp: item.price,
        sellingPrice: item.price,
        discountPercent: 0,
        images: [item.imageUrl],
        inStock: true,
        isHidden: false,
        isTrending: true,
        storeId: 'store-central',
        createdAt: '',
        updatedAt: '',
      });
    });
    Alert.alert('Items Added', `${order.items.length} items added to your cart.`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Orders</Text>
        <Text style={styles.headerSub}>Live tracking & order history</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {orders.length === 0 ? (
          <View style={styles.noOrdersCard}>
            <View style={styles.clockCircle}>
              <Clock size={28} color={colors.brandGreen} />
            </View>
            <Text style={styles.noOrdersTitle}>No active or past orders</Text>
            <Text style={styles.noOrdersSub}>
              Order fresh daily groceries and get them delivered in 10 minutes!
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.startShopBtn}
              onPress={onExploreProducts}
            >
              <Text style={styles.startShopBtnText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((ord) => (
            <View key={ord.id} style={styles.orderCard}>
              <View style={styles.orderCardHeader}>
                <View>
                  <Text style={styles.orderCardNumber}>Order #{ord.orderNumber}</Text>
                  <Text style={styles.orderCardDate}>
                    {new Date(ord.createdAt).toLocaleDateString()} •{' '}
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    ord.status === 'delivered' ? styles.statusDelivered : styles.statusActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      ord.status === 'delivered' ? styles.statusDeliveredText : styles.statusActiveText,
                    ]}
                  >
                    {ord.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Items Summary */}
              <View style={styles.orderItemsList}>
                {ord.items.map((it, i) => (
                  <Text key={i} numberOfLines={1} style={styles.orderItemSummary}>
                    {it.qty}x {it.name} ({it.unit})
                  </Text>
                ))}
              </View>

              <View style={styles.divider} />

              {/* Card Footer: Total & Actions */}
              <View style={styles.orderCardFooter}>
                <View>
                  <Text style={styles.billLabel}>Grand Total (COD)</Text>
                  <Text style={styles.billAmount}>Rs. {ord.bill.grandTotal}</Text>
                </View>

                <View style={styles.orderActionRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.trackBtn}
                    onPress={() => onNavigateToTracking(ord.id)}
                  >
                    <Text style={styles.trackBtnText}>Live Track</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.reorderBtn}
                    onPress={() => handleReorder(ord)}
                  >
                    <RotateCcw size={13} color="#FFFFFF" />
                    <Text style={styles.reorderBtnText}>Reorder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  scrollContent: {
    padding: 14,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderCardNumber: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#111827',
  },
  orderCardDate: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusDelivered: {
    backgroundColor: '#DCFCE7',
  },
  statusActive: {
    backgroundColor: '#DBEAFE',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusDeliveredText: {
    color: '#15803D',
  },
  statusActiveText: {
    color: '#1D4ED8',
  },
  orderItemsList: {
    marginBottom: 8,
  },
  orderItemSummary: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  orderCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billLabel: {
    fontSize: 10.5,
    color: '#6B7280',
  },
  billAmount: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  orderActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.brandGreen,
    gap: 4,
  },
  reorderBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  noOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  clockCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandGreenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noOrdersTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  noOrdersSub: {
    fontSize: 12.5,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  startShopBtn: {
    backgroundColor: colors.brandGreen,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  startShopBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
