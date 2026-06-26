import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import apiClient from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { Address, OrderQuote } from '../../../types';
import { RootState } from '../../../store/store';

interface CheckoutState {
  addresses: Address[];
  selectedAddressId: string | null;
  paymentMethods: string[];
  selectedPaymentMethod: string | null;
  quote: OrderQuote | null;
  couponCode: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  addresses: [],
  selectedAddressId: null,
  paymentMethods: ['razorpay', 'cod'],
  selectedPaymentMethod: 'cod',
  quote: null,
  couponCode: '',
  isLoading: false,
  error: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAddressesSuccess: (state, action: PayloadAction<Address[]>) => {
      state.addresses = action.payload;
      state.selectedAddressId = action.payload.length > 0 ? action.payload[0].id : null;
      state.isLoading = false;
      state.error = null;
    },
    addAddressSuccess: (state, action: PayloadAction<Address>) => {
      state.addresses.push(action.payload);
      state.selectedAddressId = action.payload.id;
      state.isLoading = false;
      state.error = null;
    },
    selectAddressAction: (state, action: PayloadAction<string>) => {
      state.selectedAddressId = action.payload;
    },
    setPaymentMethodsSuccess: (state, action: PayloadAction<string[]>) => {
      state.paymentMethods = action.payload;
      state.selectedPaymentMethod = action.payload.includes('razorpay') ? 'razorpay' : action.payload[0];
    },
    selectPaymentMethodAction: (state, action: PayloadAction<string>) => {
      state.selectedPaymentMethod = action.payload;
    },
    setCouponCodeAction: (state, action: PayloadAction<string>) => {
      state.couponCode = action.payload;
    },
    calculateQuoteSuccess: (state, action: PayloadAction<OrderQuote>) => {
      state.quote = action.payload;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setAddressesSuccess,
  addAddressSuccess,
  selectAddressAction,
  setPaymentMethodsSuccess,
  selectPaymentMethodAction,
  setCouponCodeAction,
  calculateQuoteSuccess,
} = checkoutSlice.actions;

export const checkoutReducer = checkoutSlice.reducer;

export const useCheckoutStore = () => {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.checkout);

  const fetchAddresses = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await apiClient.get(ENDPOINTS.user.addresses);
      const addressData = response.data.data || [];
      dispatch(setAddressesSuccess(addressData));
    } catch (err: any) {
      console.error('Error fetching addresses:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to fetch addresses'));
      dispatch(setLoading(false));
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await apiClient.post(ENDPOINTS.user.addresses, address);
      const newAddress = response.data.data;
      dispatch(addAddressSuccess(newAddress));
      return true;
    } catch (err: any) {
      console.error('Error adding address:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to add address'));
      dispatch(setLoading(false));
      return false;
    }
  };

  const selectAddress = (id: string) => {
    dispatch(selectAddressAction(id));
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.orders.paymentOptions);
      const options = response.data.data?.methods || response.data.data || [];
      if (options.length > 0) {
        dispatch(setPaymentMethodsSuccess(options));
      }
    } catch (err) {
      console.error('Error fetching payment options:', err);
    }
  };

  const selectPaymentMethod = (method: string) => {
    dispatch(selectPaymentMethodAction(method));
  };

  const setCouponCode = (coupon: string) => {
    dispatch(setCouponCodeAction(coupon));
  };

  const calculateQuote = async (items: any[]) => {
    const { selectedAddressId, couponCode } = state;
    if (!selectedAddressId) return false;

    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const formattedItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || undefined,
        quantity: item.quantity,
      }));

      const body: any = {
        items: formattedItems,
        addressId: selectedAddressId,
      };

      if (couponCode.trim().length > 0) {
        body.couponCode = couponCode.trim();
      }

      const response = await apiClient.post(ENDPOINTS.orders.quote, body);
      dispatch(calculateQuoteSuccess(response.data.data));
      return true;
    } catch (err: any) {
      console.error('Error calculating quote:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to calculate quote'));
      dispatch(setLoading(false));
      return false;
    }
  };

  const placeOrder = async (items: any[]) => {
    const { selectedAddressId, selectedPaymentMethod, couponCode, quote } = state;
    if (!selectedAddressId || !selectedPaymentMethod) return null;

    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const formattedItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || undefined,
        quantity: item.quantity,
      }));

      const body: any = {
        items: formattedItems,
        addressId: selectedAddressId,
        paymentMethod: selectedPaymentMethod,
        quoteId: quote?.quoteId || undefined,
      };

      if (couponCode.trim().length > 0) {
        body.couponCode = couponCode.trim();
      }

      const response = await apiClient.post(ENDPOINTS.orders.base, body);
      dispatch(setLoading(false));
      return response.data.data;
    } catch (err: any) {
      console.error('Error placing order:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to place order'));
      dispatch(setLoading(false));
      return null;
    }
  };

  const verifyPayment = async (orderId: string, paymentId: string, signature: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      await apiClient.post(ENDPOINTS.payments.verify, {
        orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      });
      dispatch(setLoading(false));
      return true;
    } catch (err: any) {
      console.error('Error verifying payment:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to verify payment'));
      dispatch(setLoading(false));
      return false;
    }
  };

  return {
    ...state,
    fetchAddresses,
    addAddress,
    selectAddress,
    fetchPaymentMethods,
    selectPaymentMethod,
    setCouponCode,
    calculateQuote,
    placeOrder,
    verifyPayment,
  };
};
