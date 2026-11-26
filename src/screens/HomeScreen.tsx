import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { ChevronDown, User, Zap } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { FadeHeaderGradient } from '../components/FadeHeaderGradient';
import { AnimatedSearchBar } from '../components/AnimatedSearchBar';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { SmartLoader } from '../components/SmartLoader';
import { subscribeCategories, subscribeProducts } from '../services/dataService';
import { calculateDeliveryEta } from '../utils/geo';
import { Category, Product, DepartmentName } from '../types';

interface HomeScreenProps {
  onNavigateToCategory: (categoryId: string) => void;
  onNavigateToSearch: () => void;
  onNavigateToProfile: () => void;
  onOpenAddressSelector: () => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 14;
const PROD_COL_WIDTH = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2 - 10) / 2);

const SECTION_ORDER: { dept: DepartmentName; label: string }[] = [
  { dept: 'Grocery & Kitchen', label: 'Grocery & Kitchen' },
  { dept: 'Snacks & Drinks', label: 'Snacks & Drinks' },
  { dept: 'Liquors & Smokes', label: 'Liquors & Smokes' },
  { dept: 'Beauty & Personal Care', label: 'Beauty & Personal Care' },
  { dept: 'Household Essentials & Stationery', label: 'Household Essentials & Stationery' },
];

const SHELF_SECTIONS: { dept: DepartmentName; label: string }[] = [
  { dept: 'Late Night Combos', label: 'Late Night Combos' },
  { dept: 'Frozen Items', label: 'Frozen Items' },
  { dept: 'Trending Products', label: 'Trending Products' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToCategory,
  onNavigateToSearch,
  onNavigateToProfile,
  onOpenAddressSelector,
  onScroll,
}) => {
  const { user, activeAddress } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const unsubCats = subscribeCategories((cats) => {
      setCategories(cats);
      setInitialLoading(false);
    });
    const unsubProds = subscribeProducts(null, (prods) => {
      setProducts(prods);
      setInitialLoading(false);
    });
    return () => { unsubCats(); unsubProds(); };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Shopper';

  // Dynamic ETA from Dark Store to user address
  const eta = useMemo(
    () => calculateDeliveryEta(activeAddress?.lat, activeAddress?.lng),
    [activeAddress?.lat, activeAddress?.lng]
  );

  const getDeptCategories = (dept: DepartmentName) =>
    categories.filter((c) => c.department === dept);

  const getDeptProducts = (dept: DepartmentName) =>
    products.filter((p) => p.department === dept);

  const trendingProducts = useMemo(
    () => products.filter((p) => p.isTrending).slice(0, 10),
    [products]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FadeHeaderGradient height={200} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brandGreen} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.topGreetingBar}>
            <View>
              <Text style={styles.brandTitle}>Gozii</Text>
              <View style={styles.etaRow}>
                <Zap size={14} color={colors.brandGreen} strokeWidth={3} />
                <Text style={styles.etaText}>Delivery in {eta.label}</Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.8} style={styles.avatarButton} onPress={onNavigateToProfile}>
              <User size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Active Address Selector */}
          <TouchableOpacity activeOpacity={0.8} style={styles.addressBar} onPress={onOpenAddressSelector}>
            <Text numberOfLines={1} style={styles.addressText}>
              {activeAddress?.fullAddress || 'Select delivery location'}
            </Text>
            <ChevronDown size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Animated Search Bar */}
          <AnimatedSearchBar onPress={onNavigateToSearch} />
        </View>

        {/* Main Sections with 4-per-row Categories (TEXT ONLY) */}
        {SECTION_ORDER.map((section) => {
          const sectionCats = getDeptCategories(section.dept);
          if (sectionCats.length === 0) return null;
          return (
            <View key={section.dept} style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>{section.label}</Text>
              <View style={styles.catGrid}>
                {sectionCats.map((cat) => (
                  <CategoryCard key={cat.id} category={cat} onPress={() => onNavigateToCategory(cat.id)} />
                ))}
              </View>
            </View>
          );
        })}

        {/* Shelf Sections (Combos, Frozen, Trending) */}
        {SHELF_SECTIONS.map((shelf) => {
          const shelfProducts = getDeptProducts(shelf.dept);
          if (shelfProducts.length === 0) return null;
          return (
            <View key={shelf.dept} style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>{shelf.label}</Text>
              <View style={styles.productGrid}>
                {shelfProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} onPress={() => setSelectedProduct(prod)} width={PROD_COL_WIDTH} />
                ))}
              </View>
            </View>
          );
        })}

        {/* Popular Right Now Feed */}
        {trendingProducts.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Popular Right Now</Text>
            <View style={styles.productGrid}>
              {trendingProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} onPress={() => setSelectedProduct(prod)} width={PROD_COL_WIDTH} />
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Smart Loader */}
      <SmartLoader loading={initialLoading} />

      {/* Product Detail Modal */}
      <ProductDetailModal product={selectedProduct} visible={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 20 },
  header: { paddingHorizontal: GRID_PADDING, paddingTop: 52, paddingBottom: 10, zIndex: 1 },
  topGreetingBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  brandTitle: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
  etaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 },
  etaText: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  avatarButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.canvasMuted, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  addressBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingVertical: 4 },
  addressText: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginRight: 4 },
  sectionBlock: { paddingHorizontal: GRID_PADDING, marginTop: 18 },
  sectionHeading: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3, marginBottom: 10 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
