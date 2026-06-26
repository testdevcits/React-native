import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import apiClient from '../../../api/client';
import { getAccessToken, saveTokens, clearTokens } from '../../../api/keychain';
import { ENDPOINTS } from '../../../api/endpoints';
import { User } from '../../../types';
import { RootState } from '../../../store/store';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  validationErrors: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.validationErrors = null;
    },
    setAuthFailed: (state, action: PayloadAction<{ error: string; validationErrors: Record<string, string> | null }>) => {
      state.isLoading = false;
      state.error = action.payload.error;
      state.validationErrors = action.payload.validationErrors;
    },
    clearErrorsAction: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.validationErrors = null;
    },
  },
});

export const {
  setLoading,
  setAuthSuccess,
  setAuthFailed,
  clearErrorsAction,
  logoutSuccess,
} = authSlice.actions;

export const authReducer = authSlice.reducer;

const formatUser = (apiUser: any): User => {
  if (!apiUser) return null as any;
  const firstName = apiUser.profile?.firstName || '';
  const lastName = apiUser.profile?.lastName || '';
  const fullName = apiUser.name || `${firstName} ${lastName}`.trim() || apiUser.email;
  return {
    ...apiUser,
    id: apiUser.id || apiUser._id,
    name: fullName,
  };
};

export const useAuthStore = () => {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.auth);

  const clearErrors = () => {
    dispatch(clearErrorsAction());
  };

  const login = async (body: any): Promise<boolean> => {
    dispatch(setLoading(true));
    dispatch(clearErrorsAction());
    try {
      const response = await apiClient.post(ENDPOINTS.auth.login, body);
      const data = response.data.data;
      const user = formatUser(data.user || data);
      
      const accessToken = data.tokens?.accessToken || data.accessToken;
      const refreshToken = data.tokens?.refreshToken || data.refreshToken;
      
      await saveTokens(accessToken, refreshToken);
      dispatch(setAuthSuccess(user));
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      const valErrors = err.response?.data?.error?.details?.fields;
      const validationMap: Record<string, string> = {};
      if (Array.isArray(valErrors)) {
        valErrors.forEach((e: any) => {
          validationMap[e.field] = e.message;
        });
      }
      dispatch(setAuthFailed({
        error: errorMsg,
        validationErrors: Object.keys(validationMap).length > 0 ? validationMap : null,
      }));
      return false;
    }
  };

  const register = async (body: any): Promise<boolean> => {
    dispatch(setLoading(true));
    dispatch(clearErrorsAction());
    try {
      const nameParts = (body.name || '').trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const payload = {
        ...body,
        profile: body.profile || {
          firstName,
          lastName,
        }
      };

      const response = await apiClient.post(ENDPOINTS.auth.register, payload);
      const data = response.data.data;
      const user = formatUser(data.user || data);
      
      const accessToken = data.tokens?.accessToken || data.accessToken;
      const refreshToken = data.tokens?.refreshToken || data.refreshToken;
      
      await saveTokens(accessToken, refreshToken);
      dispatch(setAuthSuccess(user));
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Registration failed.';
      const valErrors = err.response?.data?.error?.details?.fields;
      const validationMap: Record<string, string> = {};
      if (Array.isArray(valErrors)) {
        valErrors.forEach((e: any) => {
          validationMap[e.field] = e.message;
        });
      }
      dispatch(setAuthFailed({
        error: errorMsg,
        validationErrors: Object.keys(validationMap).length > 0 ? validationMap : null,
      }));
      return false;
    }
  };

  const logout = async () => {
    dispatch(setLoading(true));
    await clearTokens();
    dispatch(logoutSuccess());
  };

  const checkAuthStatus = async () => {
    const token = await getAccessToken();
    if (!token) {
      dispatch(logoutSuccess());
      return;
    }
    dispatch(setLoading(true));
    try {
      const response = await apiClient.get(ENDPOINTS.auth.status);
      const rawUser = response.data.data.user || response.data.data;
      dispatch(setAuthSuccess(formatUser(rawUser)));
    } catch (err) {
      await clearTokens();
      dispatch(logoutSuccess());
    }
  };

  return {
    ...state,
    clearErrors,
    login,
    register,
    logout,
    checkAuthStatus,
  };
};
