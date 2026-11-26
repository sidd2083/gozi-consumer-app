import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { colors } from '../constants/theme';
import { CategoryCard } from '../components/CategoryCard';
import { CategorySplitScreen } from './CategorySplitScreen';
import { subscribeCategories } from '../services/dataService';
import { Category, DepartmentName } from '../types';

interface CategoriesTabScreenProps {
  initialCategoryId?: string;
}

const SECTION_DEPTS: { dept: DepartmentName; label: string }[] = [
  { dept: 'Grocery & Kitchen', label: 'Grocery & Kitchen' },
  { dept: 'Snacks & Drinks', label: 'Snacks & Drinks' },
  { dept: 'Liquors & Smokes', label: 'Liquors & Smokes' },
  { dept: 'Beauty & Personal Care', label: 'Beauty & Personal Care' },
  { dept: 'Household Essentials & Stationery', label: 'Household Essentials' },
];

export const CategoriesTabScreen: React.FC<CategoriesTabScreenProps> = ({ initialCategoryId }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [drillCategoryId, setDrillCategoryId] = useState<string | null>(initialCategoryId || null);

  useEffect(() => {
    const unsub = subscribeCategories((cats) => setCategories(cats));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (initialCategoryId) setDrillCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  // If a category is drilled into, show split view
  if (drillCategoryId) {
    const activeCat = categories.find((c) => c.id === drillCategoryId);
    return (
      <CategorySplitScreen
        category={activeCat || null}
        allCategories={categories}
        onBack={() => setDrillCategoryId(null)}
        onSelectCategory={(id) => setDrillCategoryId(id)}
      />
    );
  }

  const getDeptCats = (dept: DepartmentName) => categories.filter((c) => c.department === dept);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Categories</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {SECTION_DEPTS.map((section) => {
          const cats = getDeptCats(section.dept);
          if (cats.length === 0) return null;
          return (
            <View key={section.dept} style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>{section.label}</Text>
              <View style={styles.catGrid}>
                {cats.map((cat) => (
                  <CategoryCard key={cat.id} category={cat} onPress={() => setDrillCategoryId(cat.id)} />
                ))}
              </View>
            </View>
          );
        })}
        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 14, paddingTop: 52, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  scrollContent: { paddingBottom: 20 },
  sectionBlock: { paddingHorizontal: 14, marginTop: 18 },
  sectionHeading: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.2, marginBottom: 10 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
