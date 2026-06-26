import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';

export const ConfirmationScreen = ({ route, navigation }: any) => {
  const { orderId, success, message } = route.params || { success: true };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.circle, success ? styles.circleSuccess : styles.circleFailure]}>
          <AppText variant="header" color="#FFF" style={styles.symbol}>
            {success ? '✓' : '✗'}
          </AppText>
        </View>

        <AppText variant="title" color="#2D3748" style={styles.title}>
          {success ? 'Order Placed Successfully!' : 'Order Placement Failed'}
        </AppText>

        <AppText variant="body" color="#718096" style={styles.description}>
          {success
            ? 'Thank you for shopping with us. Your order is being processed.'
            : message || 'We could not complete your transaction. Please try again.'}
        </AppText>

        {orderId && (
          <View style={styles.orderIdContainer}>
            <AppText variant="caption" color="#718096">
              ORDER ID
            </AppText>
            <AppText variant="subtitle" color="#2D3748" style={styles.orderId}>
              {orderId}
            </AppText>
          </View>
        )}

        <View style={styles.btnContainer}>
          {success && (
            <AppButton
              title="View Order"
              onPress={() => navigation.navigate('OrdersTab', { screen: 'OrderDetail', params: { orderId } })}
              style={styles.btn}
            />
          )}
          <AppButton
            title="Continue Shopping"
            onPress={() => navigation.navigate('HomeTab')}
            variant={success ? 'outline' : 'primary'}
            style={styles.btn}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  circleSuccess: {
    backgroundColor: '#48BB78',
  },
  circleFailure: {
    backgroundColor: '#F56565',
  },
  symbol: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  orderIdContainer: {
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  orderId: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  btnContainer: {
    width: '100%',
  },
  btn: {
    width: '100%',
  },
});
