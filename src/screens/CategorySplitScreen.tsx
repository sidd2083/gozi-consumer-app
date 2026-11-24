import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { ArrowLeft, ShoppingBag } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { FloatingCartBar } from '../components/FloatingCartBar';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { subscribeCategories, subscribeProducts } from '../services/dataService';
import { Category, Product } from '../types';

interface CategorySplitScreenProps {
  initialCategoryId: string;
  onBack: () => void;
  onNavigateToCart: () => void;
}

export const CategorySplitScreen: React.FC<CategorySplitScreenProps> = ({
  initialCategoryId,
  onBack,
  onNavigateToCart,
}) => {
  const { totalItems } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(initialCategoryId);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubCats = subscribeCategories((cats) => {
      setCategories(cats);
    });
    return () => unsubCats();
  }, []);

  useEffect(() => {
    const unsubProds = subscribeProducts(activeCategoryId, (prods) => {
      setProducts(prods);
    });
    return () => unsubProds();
  }, [activeCategoryId]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text numberOfLines={1} style={styles.headerTitle}>
            {activeCategory?.name || 'Category'}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.cartButton}
          onPress={onNavigateToCart}
        >
          <ShoppingBag size={21} color={colors.textPrimary} />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Split Layout: Left Rail + Right Product Grid */}
      <View style={styles.splitBody}>
        {/* Left Vertical Rail */}
        <View style={styles.leftRail}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {categories.map((cat) => {
              const isSelected = cat.id === activeCategoryId;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.8}
                  style={[
                    styles.railItem,
                    isSelected && styles.railItemSelected,
                  ]}
                  onPress={() => setActiveCategoryId(cat.id)}
                >
                  {/* Green left edge indicator */}
                  {isSelected && <View style={styles.activeIndicator} />}

                  <View
                    style={[
                      styles.railThumbnailBox,
                      isSelected && styles.railThumbnailBoxSelected,
                    ]}
                  >
                    <Image
                      source={{ uri: cat.imageUrl }}
                      style={styles.railThumbnail}
                      resizeMode="cover"
                    />
                  </View>

                  <Text
                    numberOfLines={2}
                    style={[
                      styles.railLabel,
                      isSelected && styles.railLabelSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right 2-Column Product Grid */}
        <View style={styles.rightFeed}>
          <FlatList
            data={products}
            numColumns={2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.feedScrollContent}
            columnWrapperStyle={styles.feedColumnWrapper}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.feedHeader}>
                <Text style={styles.feedCountText}>
                  {products.length} {products.length === 1 ? 'Product' : 'Products'}
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No items currently listed</Text>
                <Text style={styles.emptySub}>
                  Stock updates sync directly from the Gozi Admin Web Panel.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => setSelectedProduct(item)}
              />
            )}
          />
        </View>
      </View>

      {/* Floating Bottom Cart Bar */}
      <FloatingCartBar onPress={onNavigateToCart} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    flex: 1,
  },
  backButton: {
    padding: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cartButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  splitBody: {
    flex: 1,
    flexDirection: 'row',
  },
  leftRail: {
    width: 80,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  railItem: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    position: 'relative',
  },
  railItemSelected: {
    backgroundColor: '#FFFFFF',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3.5,
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  railThumbnailBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  railThumbnailBoxSelected: {
    borderColor: colors.primary,
    backgroundColor: '#ECFDF5',
  },
  railThumbnail: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
  },
  railLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 13,
  },
  railLabelSelected: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  rightFeed: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  feedScrollContent: {
    padding: 10,
    paddingBottom: 100,
  },
  feedColumnWrapper: {
    justifyContent: 'space-between',
  },
  feedHeader: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  feedCountText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
