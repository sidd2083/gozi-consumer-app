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
 * Zepto-style Floating Curved Pill / Dock Menu:
 * - Floating rounded pill (borderRadius: 28)
 * - Elevated above bottom edge with soft natural drop shadow
 * - Scroll-reactive: Slides down smoothly on scroll-down, slides up on scroll-up
 * - Active tab in Gozi logo green (#38B29C), ZERO RED
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

                {/* Live Cart Count Badge in Gozi Green */}
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
    maxWidth: 360,
    height: 58,
    backgroundColor: '#FFFFFF',
    borderRadius: 29,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: colors.brandGreenSubtle,
  },
  iconWrapper: {
    position: 'relative',
    height: 22,
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: colors.brandGreen,
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.brandGreenDark,
    fontWeight: '800',
  },
});
