import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useCart } from '../context/CartContext';

interface FloatingCartBarProps {
  onPress: () => void;
  bottomOffset?: number;
}

/**
 * Floating Cart Bar that sits cleanly above the Bottom Navigation Bar (bottom: 74)
 */
export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  onPress,
  bottomOffset = 74,
}) => {
  const { totalItems, itemTotal, items } = useCart();

  if (totalItems === 0) return null;

  const previewItems = items.slice(-3);

  return (
    <View style={[styles.floatingWrapper, { bottom: bottomOffset }]}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        style={styles.container}
      >
        {/* Left Thumbnails and Item/Price Info */}
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

        {/* Right Action CTA */}
        <View style={styles.rightSection}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <ChevronRight size={17} color="#FFFFFF" strokeWidth={2.8} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 999,
  },
  container: {
    backgroundColor: '#0C831F',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 2,
    borderWidth: 1.5,
    borderColor: '#086317',
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
    fontSize: 10.5,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginRight: 2,
  },
});
