import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { ChevronDown, User, Zap, Sparkles } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { AnimatedSearchBar } from '../components/AnimatedSearchBar';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { subscribeCategories, subscribeProducts } from '../services/dataService';
import { Category, Product } from '../types';

interface HomeScreenProps {
  onNavigateToCategory: (categoryId: string) => void;
  onNavigateToSearch: () => void;
  onNavigateToProfile: () => void;
  onOpenAddressSelector: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 14;
const COLUMN_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - 10) / 2;

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToCategory,
  onNavigateToSearch,
  onNavigateToProfile,
  onOpenAddressSelector,
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

  // 3 Clear Section Hierarchies
  const groceryCats = categories.filter((c) => c.section === 'Grocery & Kitchen');
  const snacksCats = categories.filter((c) => c.section === 'Snacks & Drinks');
  const beautyCats = categories.filter((c) => c.section === 'Beauty, Skin Care & Household');

  // Products under each section
  const groceryProducts = products.filter(
    (p) => groceryCats.some((c) => c.id === p.categoryId) || p.shelfTag === 'morning' || p.isBestseller
  );
  const snacksProducts = products.filter(
    (p) => snacksCats.some((c) => c.id === p.categoryId) || p.shelfTag === 'snacks'
  );
  const beautyProducts = products.filter(
    (p) => beautyCats.some((c) => c.id === p.categoryId) || p.shelfTag === 'beauty'
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        {/* Greeting & Profile */}
        <View style={styles.topGreetingBar}>
          <View>
            <Text style={styles.greetingText}>Hi, {firstName}</Text>
            <View style={styles.etaRow}>
              <Zap size={14} color="#38B29C" strokeWidth={3} />
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

        {/* Address Row (Tap opens map selector) */}
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

        {/* Animated Cycling Search Bar */}
        <View style={styles.searchContainer}>
          <AnimatedSearchBar
            onPress={onNavigateToSearch}
            keywords={['Milk', 'Chocolate', 'Rice', 'Snacks']}
          />
        </View>
      </View>

      {/* Main Clean Storefront */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#38B29C']} />
        }
      >
        {/* ========================================================= */}
        {/* 1. GROCERY & KITCHEN SECTION                              */}
        {/* ========================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Grocery & Kitchen</Text>
        </View>

        {/* Categories under Grocery & Kitchen */}
        <View style={styles.categoriesGrid}>
          {groceryCats.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() => onNavigateToCategory(cat.id)}
            />
          ))}
        </View>

        {/* Products under Grocery & Kitchen */}
        {groceryProducts.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalShelfList}
          >
            {groceryProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onPress={() => setSelectedProduct(prod)}
              />
            ))}
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* 2. SNACKS & DRINKS SECTION                                */}
        {/* ========================================================= */}
        <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
          <Text style={styles.sectionTitle}>Snacks & Drinks</Text>
        </View>

        {/* Categories under Snacks & Drinks */}
        <View style={styles.categoriesGrid}>
          {snacksCats.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() => onNavigateToCategory(cat.id)}
            />
          ))}
        </View>

        {/* Products under Snacks & Drinks */}
        {snacksProducts.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalShelfList}
          >
            {snacksProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onPress={() => setSelectedProduct(prod)}
              />
            ))}
          </ScrollView>
        )}

        {/* ========================================================= */}
        {/* 3. BEAUTY & SKIN CARE SECTION                             */}
        {/* ========================================================= */}
        <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
          <Text style={styles.sectionTitle}>Beauty & Skin Care</Text>
        </View>

        {/* Categories under Beauty & Skin Care */}
        <View style={styles.categoriesGrid}>
          {beautyCats.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() => onNavigateToCategory(cat.id)}
            />
          ))}
        </View>

        {/* Products under Beauty & Skin Care */}
        {beautyProducts.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalShelfList}
          >
            {beautyProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onPress={() => setSelectedProduct(prod)}
              />
            ))}
          </ScrollView>
        )}

        <View style={{ height: 110 }} />
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
    backgroundColor: '#FFFFFF', // Clean white background
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: GRID_PADDING,
    marginBottom: 12,
  },
  horizontalShelfList: {
    paddingLeft: GRID_PADDING,
    paddingRight: 6,
    marginBottom: 8,
  },
});
