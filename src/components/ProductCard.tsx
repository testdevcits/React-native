import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { AppText } from './AppText';
import { Product } from '../types';
import { colors } from '../utils/colors';
import fonts from '../utils/fonts';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 column calculation

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)
    : 0;

  const imageUrl = product.images?.[0] || 'https://via.placeholder.com/150';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <AppText variant="caption" color={colors.white} style={styles.badgeText}>
              {discountPercent}% OFF
            </AppText>
          </View>
        )}
      </View>
      <View style={styles.details}>
        <AppText variant="caption" color={colors.textLight} numberOfLines={1}>
          {product.brand || 'Brand'}
        </AppText>
        <AppText variant="medium" color={colors.textDark} numberOfLines={2} style={styles.name}>
          {product.name}
        </AppText>

        <View style={styles.ratingContainer}>
          <AppText variant="caption" color={colors.warning} style={styles.ratingStar}>★</AppText>
          <AppText variant="caption" color={colors.textMedium} style={styles.ratingText}>
            {product.rating ? product.rating.toFixed(1) : '0.0'}
          </AppText>
        </View>

        <View style={styles.priceContainer}>
          {hasDiscount ? (
            <>
              <AppText variant="medium" color={colors.danger} style={styles.discountPrice}>
                ₹{product.discountPrice}
              </AppText>
              <AppText variant="caption" color={colors.textMuted} style={styles.originalPrice}>
                ₹{product.price}
              </AppText>
            </>
          ) : (
            <AppText variant="medium" color={colors.textDark}>
              ₹{product.price}
            </AppText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.bgCard,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.1,
    backgroundColor: colors.bgLight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
  },
  details: {
    padding: 12,
  },
  name: {
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 4,
    height: 36, // Keep height consistent for alignment
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingStar: {
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    fontFamily: fonts.semiBold,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  discountPrice: {
    fontFamily: fonts.bold,
    marginRight: 6,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
});
