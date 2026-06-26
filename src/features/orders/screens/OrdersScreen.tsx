import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AppText } from '../../../components/AppText';
import { StatusBadge } from '../../../components/StatusBadge';
import { EmptyState } from '../../../components/EmptyState';
import { useOrdersStore } from '../store/ordersStore';

export const OrdersScreen = ({ navigation }: any) => {
  const { orders, isLoading, page, totalPages, hasMore, fetchOrders } = useOrdersStore();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOrders(true);
    });
    return unsubscribe;
  }, [navigation]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchOrders(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  if (isLoading && orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3182CE" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No Orders Found"
        description="You haven't placed any orders yet. Place your first order today!"
        buttonTitle="Shop Now"
        onButtonPress={() => navigation.navigate('HomeTab')}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={isLoading && page === 1}
        onRefresh={handleRefresh}
        ListFooterComponent={
          isLoading && page > 1 ? (
            <ActivityIndicator size="small" color="#3182CE" style={styles.footerLoader} />
          ) : null
        }
        renderItem={({ item }) => {
          const itemCount = item.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;
          const orderDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : new Date(item.date).toLocaleDateString();

          return (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <View>
                  <AppText variant="caption" color="#718096">
                    ORDER ID
                  </AppText>
                  <AppText variant="medium" color="#2D3748" style={styles.orderId}>
                    {item.orderId || item.id}
                  </AppText>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <AppText variant="caption" color="#718096">Date:</AppText>
                  <AppText variant="body" color="#4A5568">{orderDate}</AppText>
                </View>
                <View style={styles.infoRow}>
                  <AppText variant="caption" color="#718096">Items Count:</AppText>
                  <AppText variant="body" color="#4A5568">{itemCount} items</AppText>
                </View>
                <View style={styles.infoRow}>
                  <AppText variant="caption" color="#718096">Total Payable:</AppText>
                  <AppText variant="medium" color="#3182CE">₹{item.total}</AppText>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <AppText variant="caption" color="#3182CE" style={styles.footerText}>
                  View details & tracking →
                </AppText>
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
  orderCard: {
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
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderColor: '#EDF2F7',
    paddingBottom: 12,
  },
  orderId: {
    fontWeight: '700',
    marginTop: 2,
  },
  cardBody: {
    paddingVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderColor: '#EDF2F7',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  footerText: {
    fontWeight: '600',
  },
  footerLoader: {
    marginVertical: 16,
  },
});
