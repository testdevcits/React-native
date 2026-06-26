import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Linking } from 'react-native';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { StatusBadge } from '../../../components/StatusBadge';
import { AppLoader } from '../../../components/AppLoader';
import { useOrdersStore } from '../store/ordersStore';
import { BASE_URL } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export const OrderDetailScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const { currentOrder, isLoading, fetchOrderDetail, cancelOrder } = useOrdersStore();
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchOrderDetail(orderId);
  }, [orderId]);

  const handleCancelOrder = () => {
    Alert.prompt(
      'Cancel Order',
      'Please enter a reason for cancelling this order:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async (reason) => {
            if (!reason || reason.trim().length === 0) {
              Alert.alert('Required', 'A cancellation reason is required.');
              return;
            }
            const success = await cancelOrder(orderId, reason);
            if (success) {
              Alert.alert('Success', 'Order cancelled successfully.');
            }
          },
        },
      ],
      'plain-text',
      ''
    );
  };

  const handleDownloadInvoice = async () => {
    const invoiceUrl = `${BASE_URL}${ENDPOINTS.orders.invoice(orderId)}`;
    try {
      const supported = await Linking.canOpenURL(invoiceUrl);
      if (supported) {
        await Linking.openURL(invoiceUrl);
      } else {
        Alert.alert('Error', 'Cannot download invoice. Device does not support opening URLs.');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while opening the invoice link.');
    }
  };

  if (isLoading && !currentOrder) {
    return <AppLoader message="Fetching order details..." />;
  }

  if (!currentOrder) {
    return (
      <View style={styles.centerContainer}>
        <AppText variant="subtitle" color="#718096">Order details not found.</AppText>
      </View>
    );
  }

  const o = currentOrder;
  const orderDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : new Date(o.date).toLocaleDateString();

  // Status mapping for timeline stepper
  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStatusIndex = statuses.indexOf(o.status.toLowerCase());

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <AppText variant="caption" color="#718096">ORDER ID</AppText>
              <AppText variant="title" color="#2D3748" style={styles.boldText}>
                {o.orderId || o.id}
              </AppText>
            </View>
            <StatusBadge status={o.status} />
          </View>
          <AppText variant="caption" color="#718096" style={styles.dateLabel}>
            Ordered on: {orderDate}
          </AppText>
        </View>

        {/* Timeline Stepper */}
        {o.status.toLowerCase() !== 'cancelled' && (
          <View style={styles.card}>
            <AppText variant="subtitle" color="#2D3748" style={styles.sectionTitle}>
              Tracking
            </AppText>
            <View style={styles.timeline}>
              {statuses.map((st, idx) => {
                const isActive = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                return (
                  <View key={st} style={styles.timelineItem}>
                    <View style={styles.markerContainer}>
                      <View style={[
                        styles.marker,
                        isActive ? styles.markerActive : null,
                        isCurrent ? styles.markerCurrent : null
                      ]} />
                      {idx < statuses.length - 1 && (
                        <View style={[
                          styles.line,
                          idx < currentStatusIndex ? styles.lineActive : null
                        ]} />
                      )}
                    </View>
                    <View style={styles.timelineLabel}>
                      <AppText
                        variant={isCurrent ? 'medium' : 'body'}
                        color={isActive ? '#3182CE' : '#A0AEC0'}
                      >
                        {st.toUpperCase()}
                      </AppText>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Items List */}
        <View style={styles.card}>
          <AppText variant="subtitle" color="#2D3748" style={styles.sectionTitle}>
            Items ordered
          </AppText>
          {o.items?.map((item, index) => {
            const prod = item.product;
            const imageUrl = prod?.images?.[0] || 'https://via.placeholder.com/60';
            const variant = prod?.variants?.find((v) => v.id === item.variantId);
            const variantText = variant ? `${variant.name} (${variant.size || ''} ${variant.color || ''})` : '';

            return (
              <View key={index} style={styles.itemRow}>
                <Image source={{ uri: imageUrl }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <AppText variant="medium" color="#2D3748" numberOfLines={1}>
                    {prod?.name || 'Product'}
                  </AppText>
                  {variantText ? (
                    <AppText variant="caption" color="#718096">
                      {variantText}
                    </AppText>
                  ) : null}
                  <AppText variant="caption" color="#718096" style={styles.qtyText}>
                    Qty: {item.quantity} × ₹{item.price}
                  </AppText>
                </View>
                <AppText variant="medium" color="#2D3748" style={styles.itemPrice}>
                  ₹{item.price * item.quantity}
                </AppText>
              </View>
            );
          })}
        </View>

        {/* Shipping Address */}
        <View style={styles.card}>
          <AppText variant="subtitle" color="#2D3748" style={styles.sectionTitle}>
            Shipping Details
          </AppText>
          {o.address ? (
            <View>
              <AppText variant="medium" color="#2D3748">{o.address.name}</AppText>
              <AppText variant="body" color="#4A5568" style={styles.addressLine}>
                {o.address.line1}, {o.address.line2 ? `${o.address.line2}, ` : ''}{o.address.city}, {o.address.state} - {o.address.pincode}
              </AppText>
              <AppText variant="caption" color="#718096">Phone: {o.address.phone}</AppText>
            </View>
          ) : (
            <AppText variant="body" color="#718096">No address provided</AppText>
          )}
        </View>

        {/* Pricing Summary */}
        <View style={styles.card}>
          <AppText variant="subtitle" color="#2D3748" style={styles.sectionTitle}>
            Payment Summary
          </AppText>
          <View style={styles.priceSummaryRow}>
            <AppText variant="body" color="#718096">Subtotal</AppText>
            <AppText variant="body" color="#2D3748">₹{o.subtotal}</AppText>
          </View>
          {o.discount > 0 && (
            <View style={styles.priceSummaryRow}>
              <AppText variant="body" color="#E53E3E">Discount</AppText>
              <AppText variant="body" color="#E53E3E">- ₹{o.discount}</AppText>
            </View>
          )}
          <View style={styles.priceSummaryRow}>
            <AppText variant="body" color="#718096">Shipping</AppText>
            <AppText variant="body" color="#2D3748">₹{o.shipping}</AppText>
          </View>
          <View style={styles.priceSummaryRow}>
            <AppText variant="body" color="#718096">Tax</AppText>
            <AppText variant="body" color="#2D3748">₹{o.tax}</AppText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.priceTotalRow}>
            <AppText variant="subtitle" color="#2D3748">Total paid</AppText>
            <AppText variant="title" color="#3182CE" style={styles.boldText}>₹{o.total}</AppText>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actionSection}>
          {/* Cancel Button: pending or confirmed */}
          {(o.status.toLowerCase() === 'pending' || o.status.toLowerCase() === 'confirmed') && (
            <AppButton
              title="Cancel Order"
              variant="danger"
              onPress={handleCancelOrder}
              style={styles.actionBtn}
            />
          )}

          {/* Return Request Button: delivered */}
          {o.status.toLowerCase() === 'delivered' && (
            <AppButton
              title="Request Return"
              onPress={() => navigation.navigate('ReturnRequest', { orderId: o.id, order: o })}
              style={styles.actionBtn}
            />
          )}

          {/* Invoice Button: delivered or return_requested */}
          {(o.status.toLowerCase() === 'delivered' || o.status.toLowerCase() === 'return_requested') && (
            <AppButton
              title="Download Invoice"
              variant="outline"
              onPress={handleDownloadInvoice}
              style={styles.actionBtn}
            />
          )}
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boldText: {
    fontWeight: '800',
  },
  dateLabel: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  timeline: {
    flexDirection: 'column',
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  markerContainer: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    height: 24,
    justifyContent: 'center',
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E0',
  },
  markerActive: {
    backgroundColor: '#90CDF4',
  },
  markerCurrent: {
    backgroundColor: '#3182CE',
    borderWidth: 3,
    borderColor: '#EBF8FF',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  line: {
    position: 'absolute',
    top: 14,
    width: 2,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  lineActive: {
    backgroundColor: '#90CDF4',
  },
  timelineLabel: {
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F7FAFC',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  qtyText: {
    marginTop: 2,
  },
  itemPrice: {
    fontWeight: '700',
  },
  addressLine: {
    marginVertical: 4,
    lineHeight: 18,
  },
  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 8,
  },
  priceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionSection: {
    marginBottom: 24,
  },
  actionBtn: {
    marginBottom: 8,
  },
});
