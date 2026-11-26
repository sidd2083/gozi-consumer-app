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
import { ProductCard3Col } from '../components/ProductCard3Col';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { SmartLoader } from '../components/SmartLoader';
import { GoziLogo } from '../components/GoziLogo';
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
const SCREEN_PADDING = 12;

// 3-column product grid math:
// Available width = SCREEN_WIDTH - (SCREEN_PADDING * 2) = SCREEN_WIDTH - 24
// 2 gaps between 3 columns of 8px = 16px
// Product card width = Math.floor((SCREEN_WIDTH - 24 - 16) / 3)
const PROD_CARD_WIDTH = Math.floor((SCREEN_WIDTH - 40) / 3);

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
    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  };

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
    () => products.filter((p) => p.isTrending).slice(0, 12),
    [products]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FadeHeaderGradient height={220} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brandGreen}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Blinkit-Style Top Header */}
        <View style={styles.header}>
          {/* Row 1: Brand & Profile */}
          <View style={styles.topBrandRow}>
            <View style={styles.brandBadge}>
              <GoziLogo size={28} />
              <Text style={styles.brandTitleSmall}>gozii</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.avatarButton}
              onPress={onNavigateToProfile}
            >
              <User size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Row 2: HUGE Blinkit Delivery Time */}
          <View style={styles.bigEtaContainer}>
            <Text style={styles.bigEtaNumber}>{eta.label}</Text>
            <View style={styles.lightningPill}>
              <Zap size={14} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.lightningText}>LIGHTNING FAST</Text>
            </View>
          </View>

          {/* Row 3: Exact Location Dropdown (No Plus Codes / No c2cr) */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addressBar}
            onPress={onOpenAddressSelector}
          >
            <View style={styles.addressMeta}>
              <Text style={styles.deliveryToLabel}>DELIVERY TO</Text>
              <View style={styles.addressNameRow}>
                <Text numberOfLines={1} style={styles.addressText}>
                  {activeAddress?.fullAddress || 'School Road, Hetauda-4, Makwanpur'}
                </Text>
                <ChevronDown size={15} color={colors.textPrimary} strokeWidth={2.5} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Row 4: Search Bar */}
          <AnimatedSearchBar onPress={onNavigateToSearch} />
        </View>

        {/* Main Sections with 4-per-row Categories (Blinkit Size with Images) */}
        {SECTION_ORDER.map((section) => {
          const sectionCats = getDeptCategories(section.dept);
          if (sectionCats.length === 0) return null;
          return (
            <View key={section.dept} style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>{section.label}</Text>
              <View style={styles.catGrid}>
                {sectionCats.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    onPress={() => onNavigateToCategory(cat.id)}
                  />
                ))}
              </View>
            </View>
          );
        })}

        {/* Curated Shelf Sections: 3-IN-A-ROW PRODUCTS */}
        {SHELF_SECTIONS.map((shelf) => {
          const shelfProducts = getDeptProducts(shelf.dept);
          if (shelfProducts.length === 0) return null;
          return (
            <View key={shelf.dept} style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>{shelf.label}</Text>
              <View style={styles.productGrid3Col}>
                {shelfProducts.map((prod) => (
                  <ProductCard3Col
                    key={prod.id}
                    product={prod}
                    onPress={() => setSelectedProduct(prod)}
                    width={PROD_CARD_WIDTH}
                  />
                ))}
              </View>
            </View>
          );
        })}

        {/* Popular Right Now Feed: 3-IN-A-ROW PRODUCTS */}
        {trendingProducts.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Popular in Hetauda Right Now</Text>
            <View style={styles.productGrid3Col}>
              {trendingProducts.map((prod) => (
                <ProductCard3Col
                  key={prod.id}
                  product={prod}
                  onPress={() => setSelectedProduct(prod)}
                  width={PROD_CARD_WIDTH}
                />
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Smart Loader */}
      <SmartLoader loading={initialLoading} />

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
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 50,
    paddingBottom: 8,
    zIndex: 1,
  },
  topBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitleSmall: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.brandGreenDark,
    letterSpacing: -0.3,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  bigEtaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bigEtaNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  lightningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  lightningText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  addressBar: {
    marginBottom: 12,
  },
  addressMeta: {
    width: '100%',
  },
  deliveryToLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
    gap: 4,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    maxWidth: '92%',
  },
  sectionBlock: {
    paddingHorizontal: SCREEN_PADDING,
    marginTop: 20,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  productGrid3Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
