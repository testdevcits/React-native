import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { StatusBadge } from '../../../components/StatusBadge';
import { useCartStore } from '../../cart/store/cartStore';
import { Product } from '../../../types';

const { width } = Dimensions.get('window');

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { product } = route.params as { product: Product };
  const { addToCart, isLoading: isCartLoading } = useCartStore();

  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : undefined
  );
  
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.variants?.[0]?.color
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.variants?.[0]?.size
  );

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)
    : 0;

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, selectedVariant);
    if (success) {
      Alert.alert(
        'Success',
        'Product added to cart!',
        [
          { text: 'Go to Cart', onPress: () => navigation.navigate('CartTab') },
          { text: 'Continue Shopping', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/400'];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageCarousel}
        >
          {images.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.carouselImage} />
          ))}
        </ScrollView>

        <View style={styles.content}>
          {/* Brand & Stock */}
          <View style={styles.headerRow}>
            <AppText variant="caption" color="#718096">
              {product.brand || 'Brand'}
            </AppText>
            <StatusBadge status={product.stock > 0 ? 'In Stock' : 'Out of Stock'} />
          </View>

          {/* Product Name */}
          <AppText variant="title" color="#2D3748" style={styles.productName}>
            {product.name}
          </AppText>

          {/* Price Container */}
          <View style={styles.priceContainer}>
            {hasDiscount ? (
              <View style={styles.priceRow}>
                <AppText variant="header" color="#E53E3E" style={styles.discountPrice}>
                  ₹{product.discountPrice}
                </AppText>
                <AppText variant="subtitle" color="#A0AEC0" style={styles.originalPrice}>
                  ₹{product.price}
                </AppText>
                <View style={styles.discountBadge}>
                  <AppText variant="caption" color="#FFF" style={styles.badgeText}>
                    {discountPercent}% OFF
                  </AppText>
                </View>
              </View>
            ) : (
              <AppText variant="header" color="#2D3748">
                ₹{product.price}
              </AppText>
            )}
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <AppText variant="subtitle" color="#D69E2E">★</AppText>
            <AppText variant="medium" color="#4A5568" style={styles.ratingText}>
              {product.rating ? product.rating.toFixed(1) : '0.0'}
            </AppText>
          </View>

          {/* Variant Selectors if they exist */}
          {product.variants && product.variants.length > 0 && (
            <View style={styles.variantsSection}>
              <AppText variant="subtitle" color="#2D3748" style={styles.sectionTitle}>
                Select Variant
              </AppText>
              <View style={styles.variantsRow}>
                {product.variants.map((v) => {
                  const isSelected = selectedVariant === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[
                        styles.variantBtn,
                        isSelected ? styles.variantBtnSelected : null,
                      ]}
                      onPress={() => {
                        setSelectedVariant(v.id);
                        setSelectedColor(v.color);
                        setSelectedSize(v.size);
                      }}
                    >
                      <AppText
                        variant="medium"
                        color={isSelected ? '#FFF' : '#4A5568'}
                      >
                        {v.name} {v.size ? `(${v.size})` : ''} {v.color ? `(${v.color})` : ''} - ₹{v.price}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.descSection}>
            <AppText variant="subtitle" color="#2D3748" style={styles.sectionTitle}>
              Description
            </AppText>
            <AppText variant="body" color="#4A5568" style={styles.description}>
              {product.description || 'No description available for this product.'}
            </AppText>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Add To Cart Button */}
      <View style={styles.bottomBar}>
        <AppButton
          title={product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          onPress={handleAddToCart}
          disabled={product.stock <= 0}
          isLoading={isCartLoading}
          style={styles.addBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  imageCarousel: {
    width: width,
    height: width * 1.1,
    backgroundColor: '#F7FAFC',
  },
  carouselImage: {
    width: width,
    height: width * 1.1,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    marginBottom: 12,
    fontSize: 22,
    lineHeight: 28,
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountPrice: {
    fontWeight: '800',
    marginRight: 8,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#E53E3E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingText: {
    marginLeft: 4,
  },
  variantsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 10,
  },
  variantsRow: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  variantBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginRight: 8,
    marginBottom: 8,
  },
  variantBtnSelected: {
    backgroundColor: '#3182CE',
    borderColor: '#3182CE',
  },
  descSection: {
    marginTop: 8,
  },
  description: {
    lineHeight: 22,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderColor: '#EDF2F7',
    padding: 16,
    backgroundColor: '#FFF',
  },
  addBtn: {
    marginVertical: 0,
  },
});
