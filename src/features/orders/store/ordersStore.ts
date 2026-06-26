import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import apiClient from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { Order } from '../../../types';
import { RootState } from '../../../store/store';

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  page: 1,
  totalPages: 1,
  hasMore: true,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFetchStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setOrdersSuccess: (
      state,
      action: PayloadAction<{ orders: Order[]; page: number; totalPages: number; hasMore: boolean; refresh: boolean }>
    ) => {
      state.orders = action.payload.refresh
        ? action.payload.orders
        : [...state.orders, ...action.payload.orders];
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.hasMore = action.payload.hasMore;
      state.isLoading = false;
      state.error = null;
    },
    setOrderDetailSuccess: (state, action: PayloadAction<Order>) => {
      state.currentOrder = action.payload;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setFetchStart,
  setOrdersSuccess,
  setOrderDetailSuccess,
} = ordersSlice.actions;

export const ordersReducer = ordersSlice.reducer;

export const useOrdersStore = () => {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.orders);

  const fetchOrders = async (refresh = false) => {
    const { page, isLoading, hasMore } = state;
    if (isLoading) return;
    if (!refresh && !hasMore) return;

    const nextPage = refresh ? 1 : page;
    dispatch(setFetchStart());

    try {
      const response = await apiClient.get(ENDPOINTS.orders.me, {
        params: {
          page: nextPage,
          limit: 10,
        },
      });

      const { data: newOrders, pagination } = response.data;
      const totalPages = pagination?.totalPages || 1;
      const currentPage = pagination?.page || nextPage;

      dispatch(
        setOrdersSuccess({
          orders: newOrders,
          page: currentPage + 1,
          totalPages,
          hasMore: currentPage < totalPages,
          refresh,
        })
      );
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to fetch orders'));
      dispatch(setLoading(false));
    }
  };

  const fetchOrderDetail = async (orderId: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await apiClient.get(ENDPOINTS.orders.detail(orderId));
      dispatch(setOrderDetailSuccess(response.data.data));
    } catch (err: any) {
      console.error('Error fetching order detail:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to fetch order details'));
      dispatch(setLoading(false));
    }
  };

  const cancelOrder = async (orderId: string, reason: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      await apiClient.post(ENDPOINTS.orders.cancel(orderId), { reason });
      // Fetch details again
      const response = await apiClient.get(ENDPOINTS.orders.detail(orderId));
      dispatch(setOrderDetailSuccess(response.data.data));
      return true;
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to cancel order'));
      dispatch(setLoading(false));
      return false;
    }
  };

  return {
    ...state,
    fetchOrders,
    fetchOrderDetail,
    cancelOrder,
  };
};
