import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  User as UserIcon,
  Phone,
  MapPin,
  Clock,
  RotateCcw,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { subscribeUserOrders } from '../services/dataService';
import { Order } from '../types';

interface ProfileScreenProps {
  onBack: () => void;
  onNavigateToTracking: (orderId: string) => void;
  onNavigateToAddresses: () => void;
  onOpenLogin?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onNavigateToTracking,
  onNavigateToAddresses,
  onOpenLogin,
}) => {
  const { user, logout, updateUserName } = useApp();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.name || '');

  useEffect(() => {
    if (user?.uid) {
      const unsub = subscribeUserOrders(user.uid, (list) => {
        setOrders(list);
      });
      return () => unsub();
    }
  }, [user?.uid]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateUserName(tempName.trim());
      setEditingName(false);
    }
  };

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

  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <View style={styles.emptyCenter}>
          <Text style={styles.emptyTitle}>Sign in to view your profile</Text>
          <Text style={styles.emptySub}>
            Track past 10-minute orders, saved addresses, and faster checkout.
          </Text>
          <TouchableOpacity activeOpacity={0.85} style={styles.loginBtn} onPress={onOpenLogin}>
            <Text style={styles.loginBtnText}>Sign In / Register</Text>
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
        <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.card}>
          <View style={styles.userRow}>
            <View style={styles.avatarBox}>
              <UserIcon size={24} color={colors.primary} />
            </View>

            <View style={styles.userMeta}>
              {editingName ? (
                <View style={styles.editRow}>
                  <TextInput
                    value={tempName}
                    onChangeText={setTempName}
                    style={styles.nameInput}
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleSaveName} style={styles.saveNameBtn}>
                    <Text style={styles.saveNameText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.nameHeaderRow}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <TouchableOpacity onPress={() => setEditingName(true)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Text style={styles.userPhone}>{user.phone}</Text>
            </View>
          </View>
        </View>

        {/* Saved Addresses Action */}
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.menuCard}
          onPress={onNavigateToAddresses}
        >
          <View style={styles.menuLeft}>
            <MapPin size={20} color={colors.primary} />
            <View style={styles.menuMeta}>
              <Text style={styles.menuTitle}>Saved Addresses</Text>
              <Text style={styles.menuSub}>
                {user.addresses.length} doorstep {user.addresses.length === 1 ? 'address' : 'addresses'} saved
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Order History Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Order History</Text>
        </View>

        {orders.length === 0 ? (
          <View style={styles.noOrdersCard}>
            <Clock size={24} color={colors.textMuted} />
            <Text style={styles.noOrdersTitle}>No orders yet</Text>
            <Text style={styles.noOrdersSub}>
              Place your first order and receive it in 10 minutes!
            </Text>
          </View>
        ) : (
          orders.map((ord) => (
            <View key={ord.id} style={styles.orderCard}>
              <View style={styles.orderCardHeader}>
                <View>
                  <Text style={styles.orderCardNumber}>#{ord.orderNumber}</Text>
                  <Text style={styles.orderCardDate}>
                    {new Date(ord.createdAt).toLocaleDateString()} • {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    {it.qty}x {it.name}
                  </Text>
                ))}
              </View>

              <View style={styles.divider} />

              {/* Card Footer: Total & Actions */}
              <View style={styles.orderCardFooter}>
                <View>
                  <Text style={styles.billLabel}>Total Bill</Text>
                  <Text style={styles.billAmount}>Rs. {ord.bill.grandTotal}</Text>
                </View>

                <View style={styles.orderActionRow}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.trackBtn}
                    onPress={() => onNavigateToTracking(ord.id)}
                  >
                    <Text style={styles.trackBtnText}>Track</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.reorderBtn}
                    onPress={() => handleReorder(ord)}
                  >
                    <RotateCcw size={14} color="#FFFFFF" />
                    <Text style={styles.reorderBtnText}>Reorder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Logout Button */}
        <TouchableOpacity activeOpacity={0.8} style={styles.logoutBtn} onPress={logout}>
          <LogOut size={16} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Log Out</Text>
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
  scrollContent: {
    padding: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMeta: {
    flex: 1,
    marginLeft: 14,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  userPhone: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    color: colors.textPrimary,
  },
  saveNameBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveNameText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuMeta: {
    flexDirection: 'column',
  },
  menuTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderCardNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  orderCardDate: {
    fontSize: 11,
    color: colors.textSecondary,
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
    color: colors.textSecondary,
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
    color: colors.textSecondary,
  },
  billAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  orderActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    gap: 4,
  },
  reorderBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  noOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noOrdersTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  noOrdersSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    gap: 6,
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
