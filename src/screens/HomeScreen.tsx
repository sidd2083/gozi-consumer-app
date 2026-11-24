import React, { useState, useEffect, useRef } from 'react';
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
import { ChevronDown, User, Zap, Sparkles } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { AnimatedSearchBar } from '../components/AnimatedSearchBar';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { subscribeCategories, subscribeProducts } from '../services/dataService';
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
const COLUMN_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - 10) / 2;

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToCategory,
  onNavigateToSearch,
  onNavigateToProfile,
  onOpenAddressSelector,
  onScroll,
}) => {
  const { user, activeAddress, appConfig } = useApp();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubCats = subscribeCategories((cats) => {
      setCategories(cats);
    });
    const unsubProds = subscribeProducts(null, (prods) => {
      setProducts(prods);
    });

    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 400);
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Shopper';

  // 1. Top Hierarchy — Trending Items First
  const trendingItems = products.filter((p) => p.isTrending);

  // 2. Department Blocks
  const getDeptCategories = (dept: DepartmentName) =>
    categories.filter((c) => c.department === dept);

  const getDeptProducts = (dept: DepartmentName) =>
    products.filter((p) => p.department === dept);

  // 3. Recommended & More For You (Continuous endless scroll feed)
  const recommendedFeed = [...products].sort((a, b) => {
    if (a.isTrending && !b.isTrending) return -1;
    if (!a.isTrending && b.isTrending) return 1;
    return b.discountPercent - a.discountPercent;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header & Search Bar */}
      <View style={styles.header}>
        <View style={styles.topGreetingBar}>
          <View>
            <Text style={styles.greetingText}>Hi, {firstName}</Text>
            <View style={styles.etaRow}>
              <Zap size={14} color={colors.brandGreen} strokeWidth={3} />
              <Text style={styles.etaText}>Delivery in {appConfig.estimatedMinutes} mins</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.avatarButton}
            onPress={onNavigateToProfile}
          >
            <User size={18} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Active Address Selector */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.addressBar}
          onPress={onOpenAddressSelector}
        >
          <Text numberOfLines={1} style={styles.addressText}>
            {activeAddress
              ? `${activeAddress.label} - ${activeAddress.landmark || activeAddress.fullAddress}`
              : 'Select Doorstep Delivery Location'}
          </Text>
          <ChevronDown size={14} color="#111827" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Animated Cycling Search Pill */}
        <View style={styles.searchContainer}>
          <AnimatedSearchBar
            onPress={onNavigateToSearch}
            keywords={['Milk', 'Chocolate', 'Rice', 'Wai Wai', 'Coca-Cola', 'Combo Sets']}
          />
        </View>
      </View>

      {/* Main Continuous Scroll Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.brandGreen]}
          />
        }
      >
        {/* ========================================================= */}
        {/* TOP HIERARCHY: Trending Items First                       */}
        {/* ========================================================= */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithBadge}>
            <Text style={styles.sectionTitle}>Trending Near You</Text>
            <View style={styles.hotBadge}>
              <Sparkles size={11} color="#FFFFFF" />
              <Text style={styles.hotBadgeText}>HIGH DEMAND</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalShelfList}
        >
          {trendingItems.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onPress={() => setSelectedProduct(prod)}
            />
          ))}
        </ScrollView>

        {/* ========================================================= */}
        {/* DEPARTMENT 1: Grocery & Kitchen                           */}
        {/* ========================================================= */}
        <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
          <Text style={styles.sectionTitle}>Grocery & Kitchen</Text>
        </View>

        <View style={styles.categoriesGrid}>
          {getDeptCategories('Grocery & Kitchen').map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() => onNavigateToCategory(cat.id)}
            />
          ))}
        </View>

        {getDeptProducts('Grocery & Kitchen').length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalShelfList}
          >
            {getDeptProducts('Grocery & Kitchen').map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onPress={() => setSelectedProduct(prod)}
              />
            ))}
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* DEPARTMENT 2: Snacks & Drinks                             */}
        {/* ========================================================= */}
        <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
          <Text style={styles.sectionTitle}>Snacks & Drinks</Text>
        </View>

        <View style={styles.categoriesGrid}>
          {getDeptCategories('Snacks & Drinks').map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() => onNavigateToCategory(cat.id)}
            />
          ))}
        </View>

        {getDeptProducts('Snacks & Drinks').length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalShelfList}
          >
            {getDeptProducts('Snacks & Drinks').map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onPress={() => setSelectedProduct(prod)}
              />
            ))}
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* DEPARTMENT 3: Beverages & Smokes                          */}
        {/* ========================================================= */}
        <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
          <Text style={styles.sectionTitle}>Beverages & Smokes</Text>
        </View>

        <View style={styles.categoriesGrid}>
          {getDeptCategories('Beverages & Smokes').map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() => onNavigateToCategory(cat.id)}
            />
          ))}
        </View>

        {getDeptProducts('Beverages & Smokes').length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalShelfList}
          >
            {getDeptProducts('Beverages & Smokes').map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onPress={() => setSelectedProduct(prod)}
              />
            ))}
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* DEPARTMENT 4: Late Night Craving Combo (Curated Combos)   */}
        {/* ========================================================= */}
        <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
          <View style={styles.sectionTitleWithBadge}>
            <Text style={styles.sectionTitle}>Late Night Craving Combo</Text>
            <View style={styles.comboBadge}>
              <Text style={styles.comboBadgeText}>CURATED SETS</Text>
            </View>
          </View>
        </View>

        <View style={styles.categoriesGrid}>
          {getDeptCategories('Late Night Craving Combo').map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() => onNavigateToCategory(cat.id)}
            />
          ))}
        </View>

        {getDeptProducts('Late Night Craving Combo').length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalShelfList}
          >
            {getDeptProducts('Late Night Craving Combo').map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onPress={() => setSelectedProduct(prod)}
              />
            ))}
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* DEPARTMENT 5: Beauty & Personal Care                      */}
        {/* ========================================================= */}
        <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
          <Text style={styles.sectionTitle}>Beauty & Personal Care</Text>
        </View>

        <View style={styles.categoriesGrid}>
          {getDeptCategories('Beauty & Personal Care').map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() => onNavigateToCategory(cat.id)}
            />
          ))}
        </View>

        {getDeptProducts('Beauty & Personal Care').length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalShelfList}
          >
            {getDeptProducts('Beauty & Personal Care').map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onPress={() => setSelectedProduct(prod)}
              />
            ))}
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* CONTINUOUS ENDLESS SCROLL FEED: Recommended & More For You*/}
        {/* ========================================================= */}
        <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Recommended & More For You</Text>
        </View>

        <View style={styles.twoColumnGrid}>
          {recommendedFeed.map((prod) => (
            <View key={prod.id} style={styles.gridCardWrapper}>
              <ProductCard
                product={prod}
                width="100%"
                onPress={() => setSelectedProduct(prod)}
              />
            </View>
          ))}
        </View>

        {/* Bottom spacer so floating pill menu never overlaps cards */}
        <View style={{ height: 120 }} />
      </ScrollView>

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
    paddingHorizontal: GRID_PADDING,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topGreetingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  etaText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.3,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#374151',
    maxWidth: '90%',
  },
  searchContainer: {
    marginTop: 2,
  },
  scrollContent: {
    paddingTop: 12,
  },
  sectionHeaderRow: {
    paddingHorizontal: GRID_PADDING,
    marginBottom: 10,
  },
  sectionTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  hotBadge: {
    backgroundColor: colors.brandGreen,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  hotBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  comboBadge: {
    backgroundColor: colors.brandOrange,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  comboBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: GRID_PADDING,
    marginBottom: 10,
  },
  horizontalShelfList: {
    paddingLeft: GRID_PADDING,
    paddingRight: 6,
    marginBottom: 10,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: GRID_PADDING,
  },
  gridCardWrapper: {
    width: COLUMN_WIDTH,
    marginBottom: 4,
  },
});
