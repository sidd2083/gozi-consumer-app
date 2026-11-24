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
  Dimensions,
} from 'react-native';
import { colors } from '../constants/theme';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { subscribeCategories, subscribeProducts } from '../services/dataService';
import { Category, Product } from '../types';

interface CategoriesTabScreenProps {
  initialCategoryId?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Screen layout: left rail is 80px. Right feed width = SCREEN_WIDTH - 80.
// Padding on left & right of rightFeed is 10px each = 20px.
// Gap between 2 columns = 8px.
// Exact card width = (SCREEN_WIDTH - 80 - 20 - 8) / 2.
const RIGHT_FEED_WIDTH = SCREEN_WIDTH - 80;
const COLUMN_CARD_WIDTH = Math.floor((RIGHT_FEED_WIDTH - 28) / 2);

export const CategoriesTabScreen: React.FC<CategoriesTabScreenProps> = ({
  initialCategoryId,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubCats = subscribeCategories((cats) => {
      setCategories(cats);
      if (!activeCategoryId && cats.length > 0) {
        setActiveCategoryId(initialCategoryId || cats[0].id);
      }
    });
    return () => unsubCats();
  }, [initialCategoryId]);

  useEffect(() => {
    if (activeCategoryId) {
      const unsubProds = subscribeProducts(activeCategoryId, (prods) => {
        setProducts(prods);
      });
      return () => unsubProds();
    }
  }, [activeCategoryId]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Categories</Text>
        <Text style={styles.headerSub}>
          {activeCategory ? `${activeCategory.department} • ${activeCategory.name}` : 'Browse'}
        </Text>
      </View>

      {/* Split Rail Layout */}
      <View style={styles.splitBody}>
        {/* Left Category Rail */}
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

        {/* Right 2-Column Responsive Grid (Max 2 columns, zero overflow) */}
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
                  {products.length} {products.length === 1 ? 'Item' : 'Items'} available
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
                width={COLUMN_CARD_WIDTH}
                onPress={() => setSelectedProduct(item)}
              />
            )}
          />
        </View>
      </View>

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
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  headerSub: {
    fontSize: 12,
    color: colors.brandGreenDark,
    fontWeight: '700',
    marginTop: 2,
  },
  splitBody: {
    flex: 1,
    flexDirection: 'row',
  },
  leftRail: {
    width: 80,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E8ECF4',
  },
  railItem: {
    paddingVertical: 10,
    paddingHorizontal: 4,
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
    backgroundColor: colors.brandGreen,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  railThumbnailBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  railThumbnailBoxSelected: {
    borderColor: colors.brandGreen,
    backgroundColor: colors.brandGreenSubtle,
  },
  railThumbnail: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
  },
  railLabel: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 13,
  },
  railLabelSelected: {
    color: colors.brandGreenDark,
    fontWeight: '800',
  },
  rightFeed: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  feedScrollContent: {
    padding: 10,
    paddingBottom: 120,
  },
  feedColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  feedHeader: {
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  feedCountText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6B7280',
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
    color: '#111827',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#6B7280',
    textAlign: 'center',
  },
});
