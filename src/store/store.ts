import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../features/auth/store/authStore';
import { homeReducer } from '../features/home/store/homeStore';
import { cartReducer } from '../features/cart/store/cartStore';
import { checkoutReducer } from '../features/checkout/store/checkoutStore';
import { ordersReducer } from '../features/orders/store/ordersStore';
import { returnsReducer } from '../features/returns/store/returnsStore';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    home: homeReducer,
    cart: cartReducer,
    checkout: checkoutReducer,
    orders: ordersReducer,
    returns: returnsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
