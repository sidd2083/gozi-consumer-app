import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { subscribeProducts } from '../services/dataService';
import { Category, Product } from '../types';

interface CategorySplitScreenProps {
  category: Category | null;
  allCategories: Category[];
  onBack: () => void;
  onSelectCategory: (id: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LEFT_RAIL_WIDTH = 80;
const COLUMN_CARD_WIDTH = Math.floor((SCREEN_WIDTH - LEFT_RAIL_WIDTH - 28) / 2);

export const CategorySplitScreen: React.FC<CategorySplitScreenProps> = ({ category, allCategories, onBack, onSelectCategory }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeSubCat, setActiveSubCat] = useState<string>('All');

  useEffect(() => {
    setActiveSubCat('All');
    if (category?.id) {
      const unsub = subscribeProducts(category.id, (prods) => setProducts(prods));
      return () => unsub();
    }
  }, [category?.id]);

  const subCategories = useMemo(() => category?.subCategories || ['All'], [category]);
  const filteredProducts = useMemo(() => {
    if (activeSubCat === 'All') return products;
    return products.filter((p) => p.subCategory === activeSubCat);
  }, [products, activeSubCat]);

  const railCategories = useMemo(() => {
    if (!category) return allCategories;
    return allCategories.filter((c) => c.department === category.department);
  }, [allCategories, category]);

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductCard product={item} onPress={() => setSelectedProduct(item)} width={COLUMN_CARD_WIDTH} />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <Text style={styles.headerTitle} numberOfLines={1}>{category?.name || 'Category'}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{category?.department || ''}</Text>
        </View>
      </View>

      {/* Sub-Category Chips */}
      {subCategories.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
          {subCategories.map((sub) => {
            const isActive = sub === activeSubCat;
            return (
              <TouchableOpacity key={sub} activeOpacity={0.8} style={[styles.chip, isActive && styles.chipActive]} onPress={() => setActiveSubCat(sub)}>
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{sub}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Split Rail Layout */}
      <View style={styles.splitBody}>
        {/* Left Category Rail */}
        <View style={styles.leftRail}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {railCategories.map((cat) => {
              const isSelected = cat.id === category?.id;
              return (
                <TouchableOpacity key={cat.id} activeOpacity={0.8} style={[styles.railItem, isSelected && styles.railItemSelected]} onPress={() => onSelectCategory(cat.id)}>
                  {isSelected && <View style={styles.activeIndicator} />}
                  <Text numberOfLines={2} style={[styles.railText, isSelected && styles.railTextSelected]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right 2-Column Vertical Product Grid (strict, no horizontal scroll) */}
        <View style={styles.rightFeed}>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}><Text style={styles.emptyText}>No products found</Text></View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.feedContent}
            />
          )}
        </View>
      </View>

      <ProductDetailModal product={selectedProduct} visible={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 52, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.canvasMuted, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  headerMeta: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  chipScroll: { maxHeight: 44, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  chipContent: { paddingHorizontal: 14, paddingVertical: 8, gap: 6, flexDirection: 'row' },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.canvasMuted, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.brandGreenLight, borderColor: colors.brandGreen },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  chipTextActive: { color: colors.brandGreenDark },
  splitBody: { flex: 1, flexDirection: 'row' },
  leftRail: { width: LEFT_RAIL_WIDTH, backgroundColor: '#F9FAFB', borderRightWidth: 1, borderRightColor: colors.borderLight },
  railItem: { paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center', position: 'relative' },
  railItemSelected: { backgroundColor: '#FFFFFF' },
  activeIndicator: { position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 1.5, backgroundColor: colors.brandGreen },
  railText: { fontSize: 10, fontWeight: '600', color: colors.textSecondary, textAlign: 'center', lineHeight: 13 },
  railTextSelected: { color: colors.brandGreenDark, fontWeight: '800' },
  rightFeed: { flex: 1 },
  feedContent: { padding: 10, paddingBottom: 120 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 10 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
});
