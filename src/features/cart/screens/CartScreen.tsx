import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { QuantityStepper } from '../../../components/QuantityStepper';
import { EmptyState } from '../../../components/EmptyState';
import { useCartStore } from '../store/cartStore';

export const CartScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { cart, isLoading, fetchCart, updateItemQuantity } = useCartStore();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCart();
    });
    return unsubscribe;
  }, [navigation]);

  const handleQuantityChange = async (productId: string, variantId: string | undefined, newQty: number) => {
    await updateItemQuantity(productId, variantId, newQty);
  };

  const handleCheckout = () => {
    if (cart && cart.items && cart.items.length > 0) {
      navigation.navigate('Checkout', { items: cart.items });
    }
  };

  if (isLoading && !cart) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3182CE" />
      </View>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your Cart is Empty"
        description="Looks like you haven't added anything to your cart yet. Discover hot products on our store now."
        buttonTitle="Browse Products"
        onButtonPress={() => navigation.navigate('HomeTab')}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.productId}-${item.variantId || ''}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const product = item.product;
          if (!product) return null;
          
          const imageUrl = product.images?.[0] || 'https://via.placeholder.com/100';
          const name = product.name;
          const price = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;
          const lineTotal = price * item.quantity;
          
          // Variant details if available
          const variant = product.variants?.find((v) => v.id === item.variantId);
          const variantText = variant ? `${variant.name} ${variant.size ? `(${variant.size})` : ''} ${variant.color ? `(${variant.color})` : ''}` : '';

          return (
            <View style={styles.cartItem}>
              <Image source={{ uri: imageUrl }} style={styles.itemImage} />
              
              <View style={styles.itemDetails}>
                <AppText variant="medium" color="#2D3748" numberOfLines={1}>
                  {name}
                </AppText>
                {variantText ? (
                  <AppText variant="caption" color="#718096" style={styles.variantLabel}>
                    {variantText}
                  </AppText>
                ) : null}
                <AppText variant="caption" color="#718096" style={styles.priceLabel}>
                  Unit: ₹{price}
                </AppText>
                <View style={styles.stepperRow}>
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(val) => handleQuantityChange(item.productId, item.variantId, val)}
                  />
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(item.productId, item.variantId, 0)}
                    style={styles.removeBtn}
                  >
                    <AppText variant="caption" color="#E53E3E">Remove</AppText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rightColumn}>
                <AppText variant="medium" color="#2D3748" style={styles.totalText}>
                  ₹{lineTotal}
                </AppText>
              </View>
            </View>
          );
        }}
      />

      {/* Cart Summary & CTA */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <AppText variant="subtitle" color="#718096">
            Subtotal
          </AppText>
          <AppText variant="title" color="#2D3748" style={styles.boldText}>
            ₹{cart?.subtotal || 0}
          </AppText>
        </View>
        <AppButton
          title="Proceed to Checkout"
          onPress={handleCheckout}
          style={styles.checkoutBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  variantLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  priceLabel: {
    marginTop: 2,
    marginBottom: 6,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeBtn: {
    marginLeft: 16,
    padding: 6,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  totalText: {
    fontWeight: '700',
  },
  footer: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#EDF2F7',
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  boldText: {
    fontWeight: '800',
  },
  checkoutBtn: {
    marginVertical: 0,
  },
});
