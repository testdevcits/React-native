import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import apiClient from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { ReturnRequest } from '../../../types';
import { RootState } from '../../../store/store';

interface ReturnsState {
  returns: ReturnRequest[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ReturnsState = {
  returns: [],
  isLoading: false,
  error: null,
};

const returnsSlice = createSlice({
  name: 'returns',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setReturnsSuccess: (state, action: PayloadAction<ReturnRequest[]>) => {
      state.returns = action.payload;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setReturnsSuccess,
} = returnsSlice.actions;

export const returnsReducer = returnsSlice.reducer;

export const useReturnsStore = () => {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.returns);

  const fetchReturns = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await apiClient.get(ENDPOINTS.returns.myReturns);
      dispatch(setReturnsSuccess(response.data.data || []));
    } catch (err: any) {
      console.error('Error fetching returns:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to fetch returns'));
      dispatch(setLoading(false));
    }
  };

  const createReturnRequest = async (body: any) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      await apiClient.post(ENDPOINTS.returns.base, body);
      dispatch(setLoading(false));
      return true;
    } catch (err: any) {
      console.error('Error creating return request:', err);
      dispatch(setError(err.response?.data?.message || 'Failed to request return'));
      dispatch(setLoading(false));
      return false;
    }
  };

  return {
    ...state,
    fetchReturns,
    createReturnRequest,
  };
};
