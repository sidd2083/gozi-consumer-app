import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, LayoutGrid, ShoppingCart } from 'lucide-react-native';
import { useCart } from '../context/CartContext';

export type TabName = 'home' | 'categories' | 'cart';

interface BottomNavBarProps {
  currentTab: TabName;
  onSelectTab: (tab: TabName) => void;
}

/**
 * Bottom Nav Bar from user screenshot:
 * - Home (pentagon house icon in pink/red #E11D48 or active brand color)
 * - Category (4-dot square icon)
 * - Cart (shopping cart outline)
 */
export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onSelectTab }) => {
  const { totalItems } = useCart();

  return (
    <View style={styles.container}>
      {/* Home Tab */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.tabItem}
        onPress={() => onSelectTab('home')}
      >
        <Home
          size={22}
          color={currentTab === 'home' ? '#E11D48' : '#9CA3AF'}
          strokeWidth={currentTab === 'home' ? 2.5 : 2}
        />
        <Text style={[styles.label, currentTab === 'home' && styles.labelActive]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* Category Tab */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.tabItem}
        onPress={() => onSelectTab('categories')}
      >
        <LayoutGrid
          size={22}
          color={currentTab === 'categories' ? '#E11D48' : '#9CA3AF'}
          strokeWidth={currentTab === 'categories' ? 2.5 : 2}
        />
        <Text style={[styles.label, currentTab === 'categories' && styles.labelActive]}>
          Category
        </Text>
      </TouchableOpacity>

      {/* Cart Tab */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.tabItem}
        onPress={() => onSelectTab('cart')}
      >
        <View style={styles.cartIconBox}>
          <ShoppingCart
            size={22}
            color={currentTab === 'cart' ? '#E11D48' : '#9CA3AF'}
            strokeWidth={currentTab === 'cart' ? 2.5 : 2}
          />
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.label, currentTab === 'cart' && styles.labelActive]}>
          Cart
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 2,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 2,
  },
  labelActive: {
    color: '#E11D48',
    fontWeight: '800',
  },
  cartIconBox: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#38B29C',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
