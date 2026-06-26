import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../components/AppText';
import { ProductCard } from '../../../components/ProductCard';
import { useHomeStore } from '../store/homeStore';
import { useAuthStore } from '../../auth/store/authStore';

export const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuthStore();
  const {
    products,
    categories,
    selectedCategory,
    searchQuery,
    sortBy,
    isLoading,
    isRefreshing,
    hasMore,
    fetchCategories,
    fetchProducts,
    setSelectedCategory,
    searchProducts,
    setSortBy,
  } = useHomeStore();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts(true);
  }, []);

  // Debounce search input
  const handleSearchChange = (text: string) => {
    setSearchInput(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchProducts(text);
    }, 300);
  };

  const handleCategoryPress = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchProducts(false);
    }
  };

  const handleRefresh = () => {
    fetchProducts(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <AppText variant="caption" color="#718096">Welcome,</AppText>
          <AppText variant="subtitle" color="#2D3748">{user?.name || 'Guest User'}</AppText>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <AppText variant="caption" color="#E53E3E" style={styles.boldText}>Logout</AppText>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchInput}
          onChangeText={handleSearchChange}
          placeholderTextColor="#A0AEC0"
        />
      </View>

      {/* Category Chips */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: 'All' } as any, ...categories]}
          keyExtractor={(item) => item.id || 'all'}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  isSelected ? styles.categoryChipSelected : null,
                ]}
                onPress={() => handleCategoryPress(item.id)}
              >
                <AppText
                  variant="medium"
                  color={isSelected ? '#FFF' : '#4A5568'}
                >
                  {item.name}
                </AppText>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Sort Buttons */}
      <View style={styles.sortContainer}>
        <AppText variant="caption" color="#718096">Sort By: </AppText>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'newest' && styles.sortBtnActive]}
          onPress={() => setSortBy(sortBy === 'newest' ? null : 'newest')}
        >
          <AppText variant="caption" color={sortBy === 'newest' ? '#3182CE' : '#4A5568'}>Newest</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'price_asc' && styles.sortBtnActive]}
          onPress={() => setSortBy(sortBy === 'price_asc' ? null : 'price_asc')}
        >
          <AppText variant="caption" color={sortBy === 'price_asc' ? '#3182CE' : '#4A5568'}>Price ↑</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'price_desc' && styles.sortBtnActive]}
          onPress={() => setSortBy(sortBy === 'price_desc' ? null : 'price_desc')}
        >
          <AppText variant="caption" color={sortBy === 'price_desc' ? '#3182CE' : '#4A5568'}>Price ↓</AppText>
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.productRow}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <AppText variant="medium" color="#A0AEC0">No products found</AppText>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && !isRefreshing ? (
            <ActivityIndicator size="small" color="#3182CE" style={styles.footerLoader} />
          ) : null
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id, product: item })}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#EDF2F7',
  },
  boldText: {
    fontWeight: '700',
  },
  logoutBtn: {
    padding: 6,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    height: 44,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#2D3748',
    fontSize: 14,
  },
  categoriesWrapper: {
    paddingVertical: 6,
  },
  categoryList: {
    paddingHorizontal: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipSelected: {
    backgroundColor: '#3182CE',
    borderColor: '#3182CE',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#F7FAFC',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#EDF2F7',
  },
  sortBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortBtnActive: {
    borderColor: '#3182CE',
    backgroundColor: '#EBF8FF',
  },
  productList: {
    padding: 16,
    paddingBottom: 40,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  footerLoader: {
    marginVertical: 16,
  },
});
