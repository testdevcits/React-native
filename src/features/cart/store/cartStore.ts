import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import apiClient from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { Cart } from '../../../types';
import { RootState } from '../../../store/store';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCartSuccess: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCartFailed: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearCartSuccess: (state) => {
      state.cart = { items: [], subtotal: 0 };
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setCartSuccess,
  setCartFailed,
  clearCartSuccess,
} = cartSlice.actions;

export const cartReducer = cartSlice.reducer;

export const useCartStore = () => {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.cart);

  const fetchCart = async () => {
    dispatch(setLoading(true));
    try {
      const response = await apiClient.get(ENDPOINTS.cart.me);
      dispatch(setCartSuccess(response.data.data));
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      dispatch(setCartFailed(err.response?.data?.message || 'Failed to fetch cart'));
    }
  };

  const updateCartItems = async (items: Array<{ productId: string; variantId?: string; quantity: number }>) => {
    dispatch(setLoading(true));
    try {
      const response = await apiClient.put(ENDPOINTS.cart.me, { items });
      dispatch(setCartSuccess(response.data.data));
      return true;
    } catch (err: any) {
      console.error('Error updating cart:', err);
      dispatch(setCartFailed(err.response?.data?.message || 'Failed to update cart'));
      return false;
    }
  };

  const addToCart = async (productId: string, variantId?: string, quantity = 1) => {
    const { cart } = state;
    let updatedItems: Array<{ productId: string; variantId?: string; quantity: number }> = [];

    if (cart && cart.items) {
      updatedItems = cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const existingIndex = updatedItems.findIndex(
        (item) => item.productId === productId && item.variantId === variantId
      );

      if (existingIndex > -1) {
        updatedItems[existingIndex].quantity += quantity;
      } else {
        updatedItems.push({ productId, variantId, quantity });
      }
    } else {
      updatedItems = [{ productId, variantId, quantity }];
    }

    return updateCartItems(updatedItems);
  };

  const updateItemQuantity = async (productId: string, variantId: string | undefined, quantity: number) => {
    const { cart } = state;
    if (!cart || !cart.items) return false;

    let updatedItems = cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const index = updatedItems.findIndex(
      (item) => item.productId === productId && item.variantId === variantId
    );

    if (index > -1) {
      if (quantity <= 0) {
        updatedItems.splice(index, 1);
      } else {
        updatedItems[index].quantity = quantity;
      }
    }

    return updateCartItems(updatedItems);
  };

  const clearCart = async () => {
    dispatch(setLoading(true));
    try {
      await apiClient.put(ENDPOINTS.cart.me, { items: [] });
      dispatch(clearCartSuccess());
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      dispatch(setCartFailed(err.response?.data?.message || 'Failed to clear cart'));
    }
  };

  return {
    ...state,
    fetchCart,
    updateCartItems,
    addToCart,
    updateItemQuantity,
    clearCart,
  };
};
