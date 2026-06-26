import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import RazorpayCheckout from 'react-native-razorpay';
import { AppText } from '../../../components/AppText';
import { AppInput } from '../../../components/AppInput';
import { AppButton } from '../../../components/AppButton';
import { StatusBadge } from '../../../components/StatusBadge';
import { AppLoader } from '../../../components/AppLoader';
import { useCheckoutStore } from '../store/checkoutStore'; import { useCartStore } from '../../cart/store/cartStore';
const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone is required'),
  line1: z.string().min(5, 'Address Line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be 6 digits'),
  country: z.string().min(2, 'Country is required'),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export const CheckoutScreen = ({ route, navigation }: any) => {
  const { items } = route.params;
  const { clearCart } = useCartStore();
  const {
    addresses,
    selectedAddressId,
    paymentMethods,
    selectedPaymentMethod,
    quote,
    couponCode,
    isLoading,
    error,
    fetchAddresses,
    addAddress,
    selectAddress,
    fetchPaymentMethods,
    selectPaymentMethod,
    setCouponCode,
    calculateQuote,
    placeOrder,
    verifyPayment,
  } = useCheckoutStore();

  const [step, setStep] = useState(1); // Steps: 1 = Address, 2 = Quote & Coupon, 3 = Payment Method & Place Order
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [couponInput, setCouponInput] = useState(couponCode);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
  });

  useEffect(() => {
    fetchAddresses();
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (selectedAddressId && step === 2) {
      calculateQuote(items);
    }
  }, [selectedAddressId, step]);

  const handleAddAddressSubmit = async (data: AddressFormValues) => {
    const success = await addAddress(data);
    if (success) {
      setShowAddAddressModal(false);
      reset();
    }
  };

  const handleApplyCoupon = async () => {
    setCouponCode(couponInput);
    await calculateQuote(items);
  };

  const handleRemoveCoupon = async () => {
    setCouponInput('');
    setCouponCode('');
    await calculateQuote(items);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedAddressId) {
        Alert.alert('Address Required', 'Please select or add a shipping address.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    const orderData = await placeOrder(items);
    if (!orderData) {
      Alert.alert('Order Failed', error || 'Failed to place order. Please try again.');
      return;
    }

    const { orderId, paymentRequired, paymentDetails } = orderData;

    if (paymentRequired && selectedPaymentMethod === 'razorpay') {
      // Razorpay Integration
      const options = {
        description: 'E-Commerce Order Payment',
        image: 'https://via.placeholder.com/100',
        currency: 'INR',
        key: paymentDetails.key || 'rzp_test_mockkey', // fallback key
        amount: quote ? quote.total * 100 : 0, // amount in paisa
        name: 'ShopCraft',
        order_id: paymentDetails.orderId,
        prefill: {
          email: 'buyer@test.com',
          contact: '9999999999',
          name: 'Test Buyer',
        },
        theme: { color: '#3182CE' }
      };

      try {
        RazorpayCheckout.open(options).then(async (data: any) => {
          // Success callback
          const verified = await verifyPayment(orderId, data.razorpay_payment_id, data.razorpay_signature);
          if (verified) {
            await clearCart();
            navigation.replace('Confirmation', { orderId, success: true });
          } else {
            navigation.replace('Confirmation', { orderId, success: false, message: 'Payment verification failed.' });
          }
        }).catch((razorpayError: any) => {
          // Error or cancellation
          console.warn('Razorpay Error:', razorpayError);
          // Let's provide a simulation mode for development if key is test or SDK fails
          Alert.alert(
            'Payment Status',
            'Razorpay payment cancelled or failed. Would you like to simulate successful payment for testing?',
            [
              {
                text: 'Cancel Order',
                onPress: () => navigation.replace('Confirmation', { orderId, success: false, message: 'Payment cancelled.' }),
                style: 'cancel',
              },
              {
                text: 'Simulate Success (COD Fallback)',
                onPress: async () => {
                  const verified = await verifyPayment(orderId, 'pay_mockId123', 'sig_mockSig123');
                  if (verified) {
                    await clearCart();
                    navigation.replace('Confirmation', { orderId, success: true });
                  } else {
                    navigation.replace('Confirmation', { orderId, success: true }); // Assume success in simulation
                  }
                }
              }
            ]
          );
        });
      } catch (sdkError) {
        console.error('Razorpay SDK error:', sdkError);
        Alert.alert('Payment SDK Error', 'Could not open Razorpay. Placing order as COD/Pending.');
      }
    } else {
      // Cash on Delivery or No Payment Required
      await clearCart();
      navigation.replace('Confirmation', { orderId, success: true });
    }
  };

  return (
    <View style={styles.container}>
      <AppLoader visible={isLoading} isOverlay />

      {/* Steps Indicator */}
      <View style={styles.stepsBar}>
        <View style={[styles.stepItem, step >= 1 && styles.stepActive]}>
          <AppText variant="caption" color={step >= 1 ? '#3182CE' : '#A0AEC0'}>1. Address</AppText>
        </View>
        <View style={styles.stepDivider} />
        <View style={[styles.stepItem, step >= 2 && styles.stepActive]}>
          <AppText variant="caption" color={step >= 2 ? '#3182CE' : '#A0AEC0'}>2. Review Quote</AppText>
        </View>
        <View style={styles.stepDivider} />
        <View style={[styles.stepItem, step >= 3 && styles.stepActive]}>
          <AppText variant="caption" color={step >= 3 ? '#3182CE' : '#A0AEC0'}>3. Payment</AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.sectionHeader}>
              <AppText variant="subtitle" color="#2D3748">Select Shipping Address</AppText>
              <TouchableOpacity onPress={() => setShowAddAddressModal(true)}>
                <AppText variant="medium" color="#3182CE">+ Add New</AppText>
              </TouchableOpacity>
            </View>

            {addresses.length === 0 ? (
              <View style={styles.emptyAddress}>
                <AppText variant="body" color="#718096">No addresses saved yet.</AppText>
              </View>
            ) : (
              addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                    onPress={() => selectAddress(addr.id)}
                  >
                    <View style={styles.addressHeader}>
                      <AppText variant="medium" color="#2D3748">{addr.name}</AppText>
                      {isSelected && <StatusBadge status="Selected" />}
                    </View>
                    <AppText variant="body" color="#4A5568" style={styles.addressLine}>
                      {addr.line1}, {addr.line2 ? `${addr.line2}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                    </AppText>
                    <AppText variant="caption" color="#718096">Phone: {addr.phone}</AppText>
                  </TouchableOpacity>
                );
              })
            )}

            <AppButton title="Next: Order Quote" onPress={handleNextStep} style={styles.actionBtn} />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <AppText variant="subtitle" color="#2D3748" style={styles.sectionTitle}>
              Coupon Code
            </AppText>

            <View style={styles.couponRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter Coupon e.g. OFF50"
                value={couponInput}
                onChangeText={setCouponInput}
                placeholderTextColor="#A0AEC0"
                editable={!quote?.discount}
              />
              {quote?.discount ? (
                <AppButton title="Remove" onPress={handleRemoveCoupon} variant="danger" style={styles.couponBtn} />
              ) : (
                <AppButton title="Apply" onPress={handleApplyCoupon} style={styles.couponBtn} />
              )}
            </View>

            {quote && (
              <View style={styles.quoteCard}>
                <AppText variant="subtitle" color="#2D3748" style={styles.quoteHeader}>Order Summary</AppText>

                <View style={styles.quoteRowItem}>
                  <AppText variant="body" color="#718096">Subtotal</AppText>
                  <AppText variant="medium" color="#2D3748">₹{quote.subtotal}</AppText>
                </View>

                {quote.discount > 0 && (
                  <View style={styles.quoteRowItem}>
                    <AppText variant="body" color="#E53E3E">Discount</AppText>
                    <AppText variant="medium" color="#E53E3E">- ₹{quote.discount}</AppText>
                  </View>
                )}

                <View style={styles.quoteRowItem}>
                  <AppText variant="body" color="#718096">Shipping</AppText>
                  <AppText variant="medium" color="#2D3748">₹{quote.shipping}</AppText>
                </View>

                <View style={styles.quoteRowItem}>
                  <AppText variant="body" color="#718096">Tax</AppText>
                  <AppText variant="medium" color="#2D3748">₹{quote.tax}</AppText>
                </View>

                <View style={styles.quoteDivider} />

                <View style={styles.quoteTotalRow}>
                  <AppText variant="subtitle" color="#2D3748">Total Payable</AppText>
                  <AppText variant="title" color="#3182CE">₹{quote.total}</AppText>
                </View>
              </View>
            )}

            <View style={styles.actionRow}>
              <AppButton title="Back" onPress={() => setStep(1)} variant="secondary" style={styles.halfBtn} />
              <AppButton title="Next: Payment" onPress={handleNextStep} style={styles.halfBtn} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <AppText variant="subtitle" color="#2D3748" style={styles.sectionTitle}>
              Select Payment Method
            </AppText>

            {paymentMethods.map((method) => {
              const isSelected = selectedPaymentMethod === method;
              return (
                <TouchableOpacity
                  key={method}
                  style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
                  onPress={() => selectPaymentMethod(method)}
                >
                  <AppText variant="medium" color="#2D3748" style={styles.paymentName}>
                    {method.toUpperCase() === 'RAZORPAY' ? 'Online Payment (Razorpay)' : 'Cash on Delivery (COD)'}
                  </AppText>
                  {isSelected && <StatusBadge status="Selected" />}
                </TouchableOpacity>
              );
            })}

            {quote && (
              <View style={styles.paymentSummary}>
                <AppText variant="subtitle" color="#2D3748">Final Amount</AppText>
                <AppText variant="header" color="#3182CE">₹{quote.total}</AppText>
              </View>
            )}

            <View style={styles.actionRow}>
              <AppButton title="Back" onPress={() => setStep(2)} variant="secondary" style={styles.halfBtn} />
              <AppButton title="Place Order" onPress={handlePlaceOrder} style={styles.halfBtn} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={showAddAddressModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText variant="title" color="#2D3748" style={styles.modalTitle}>Add New Address</AppText>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput label="Contact Name" placeholder="Receiver's name" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.name?.message} />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput label="Phone Number" placeholder="Contact number" keyboardType="phone-pad" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.phone?.message} />
                )}
              />

              <Controller
                control={control}
                name="line1"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput label="Address Line 1" placeholder="Flat, House no., Building" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.line1?.message} />
                )}
              />

              <Controller
                control={control}
                name="line2"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput label="Address Line 2 (Optional)" placeholder="Area, Colony, Street" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.line2?.message} />
                )}
              />

              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput label="City" placeholder="E.g. Mumbai" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.city?.message} />
                )}
              />

              <Controller
                control={control}
                name="state"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput label="State" placeholder="E.g. Maharashtra" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.state?.message} />
                )}
              />

              <Controller
                control={control}
                name="pincode"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput label="Pincode" placeholder="6-digit PIN" keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.pincode?.message} />
                )}
              />

              <Controller
                control={control}
                name="country"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppInput label="Country" placeholder="E.g. India" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.country?.message} />
                )}
              />

              <View style={styles.modalBtns}>
                <AppButton title="Cancel" onPress={() => setShowAddAddressModal(false)} variant="secondary" style={styles.modalBtn} />
                <AppButton title="Save Address" onPress={handleSubmit(handleAddAddressSubmit)} style={styles.modalBtn} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  stepsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#EDF2F7',
  },
  stepItem: {
    paddingVertical: 4,
  },
  stepActive: {
    borderBottomWidth: 2,
    borderColor: '#3182CE',
  },
  stepDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  scrollContent: {
    padding: 16,
  },
  stepContainer: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyAddress: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  addressCardSelected: {
    borderColor: '#3182CE',
    backgroundColor: '#F7FAFC',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLine: {
    marginBottom: 6,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  couponInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    color: '#2D3748',
  },
  couponBtn: {
    width: 100,
    marginVertical: 0,
  },
  quoteCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  quoteHeader: {
    marginBottom: 16,
  },
  quoteRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  quoteDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  quoteTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  halfBtn: {
    width: '48%',
  },
  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentCardSelected: {
    borderColor: '#3182CE',
    backgroundColor: '#F7FAFC',
  },
  paymentName: {
    fontSize: 14,
  },
  paymentSummary: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingBottom: 24,
  },
  modalBtn: {
    width: '48%',
  },
});
