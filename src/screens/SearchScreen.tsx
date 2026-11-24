import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { ArrowLeft, Search as SearchIcon, X } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { FloatingCartBar } from '../components/FloatingCartBar';
import { subscribeProducts } from '../services/dataService';
import { Product } from '../types';

interface SearchScreenProps {
  onBack: () => void;
  onNavigateToCart: () => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onBack,
  onNavigateToCart,
}) => {
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsub = subscribeProducts(null, (prods) => {
      setAllProducts(prods);
      setFilteredProducts(prods);
    });
    return () => unsub();
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setFilteredProducts(allProducts);
      return;
    }
    const lower = text.toLowerCase();
    const results = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower) ||
        p.unit.toLowerCase().includes(lower)
    );
    setFilteredProducts(results);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Search Input Box */}
        <View style={styles.inputContainer}>
          <SearchIcon size={18} color={colors.textSecondary} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={handleSearch}
            placeholder="Search groceries, milk, eggs, snacks..."
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearBtn}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results Feed */}
      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.metaHeader}>
            <Text style={styles.resultsCount}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No matching items found</Text>
            <Text style={styles.emptySub}>
              Try searching for "Milk", "Eggs", "Atta", "Chips", or "Tea"
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

      {/* Floating Cart Bar */}
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
    backgroundColor: colors.canvas,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  inputContainer: {
    flex: 1,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  metaHeader: {
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
