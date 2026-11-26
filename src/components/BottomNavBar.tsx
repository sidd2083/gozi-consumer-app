import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Home, LayoutGrid, ShoppingCart } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useCart } from '../context/CartContext';

export type TabName = 'home' | 'categories' | 'cart';

interface BottomNavBarProps {
  currentTab: TabName;
  onSelectTab: (tab: TabName) => void;
  translateY?: Animated.Value;
}

/**
 * Zepto-style Floating Curved Pill / Dock Menu
 * Active tab in Gozii logo green (#27A98C), ZERO RED
 */
export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  translateY,
}) => {
  const { totalItems } = useCart();

  const tabs: { key: TabName; label: string; icon: React.FC<any> }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'categories', label: 'Categories', icon: LayoutGrid },
    { key: 'cart', label: 'Cart', icon: ShoppingCart },
  ];

  return (
    <Animated.View
      style={[
        styles.floatingWrapper,
        translateY ? { transform: [{ translateY }] } : undefined,
      ]}
    >
      <View style={styles.dockContainer}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              style={[
                styles.tabButton,
                isActive && styles.tabButtonActive,
              ]}
              onPress={() => onSelectTab(tab.key)}
            >
              <View style={styles.iconWrapper}>
                <IconComponent
                  size={20}
                  color={isActive ? colors.brandGreen : '#6B7280'}
                  strokeWidth={isActive ? 2.6 : 2}
                />

                {tab.key === 'cart' && totalItems > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {totalItems > 99 ? '99+' : totalItems}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 18,
    left: 20,
    right: 20,
    zIndex: 999,
    alignItems: 'center',
  },
  dockContainer: {
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: colors.brandGreenLight,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: colors.brandGreen,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabLabelActive: {
    color: colors.brandGreenDark,
    fontWeight: '800',
  },
});
