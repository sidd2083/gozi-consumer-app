import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useCart } from '../context/CartContext';

interface FloatingCartBarProps {
  onPress: () => void;
  translateY?: Animated.Value;
  bottomOffset?: number;
}

/**
 * Coordinated Floating Cart Summary Bar
 * Floats cleanly above the bottom dock with matching Gozi green
 */
export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  onPress,
  translateY,
  bottomOffset = 84,
}) => {
  const { totalItems, itemTotal, items } = useCart();

  if (totalItems === 0) return null;

  const previewItems = items.slice(-3);

  return (
    <Animated.View
      style={[
        styles.floatingWrapper,
        { bottom: bottomOffset },
        translateY ? { transform: [{ translateY }] } : undefined,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        style={styles.container}
      >
        <View style={styles.leftSection}>
          <View style={styles.thumbnailsContainer}>
            {previewItems.map((item, idx) => (
              <View
                key={item.product.id}
                style={[
                  styles.thumbnailFrame,
                  { marginLeft: idx === 0 ? 0 : -10 },
                ]}
              >
                <Image
                  source={{ uri: item.product.images[0] }}
                  style={styles.thumbnail}
                  resizeMode="contain"
                />
              </View>
            ))}
          </View>

          <View style={styles.metaContainer}>
            <Text style={styles.itemCountText}>
              {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}
            </Text>
            <Text style={styles.priceText}>
              Rs. {itemTotal}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.8} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 998,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.brandGreen,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: colors.brandGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailFrame: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 2,
    borderWidth: 1.5,
    borderColor: colors.brandGreenDark,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  metaContainer: {
    marginLeft: 10,
  },
  itemCountText: {
    color: '#D1FAE5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    marginRight: 2,
  },
});
