export const ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    status: '/auth/status',
  },
  
  // Platform & Catalog
  products: {
    list: '/products',
    search: '/products/search',
    categories: '/platform/categories',
  },

  // Cart
  cart: {
    me: '/carts/me',
  },

  // Checkout & Users
  user: {
    addresses: '/users/me/addresses',
  },
  orders: {
    quote: '/orders/quote',
    paymentOptions: '/payments/options',
    base: '/orders',
    cancel: (orderId: string) => `/orders/${orderId}/cancel`,
    detail: (orderId: string) => `/orders/${orderId}`,
    invoice: (orderId: string) => `/orders/${orderId}/invoice`,
    me: '/orders/me',
  },
  payments: {
    initiate: '/payments/initiate',
    verify: '/payments/verify',
  },

  // Returns
  returns: {
    base: '/returns',
    myReturns: '/returns/my-returns',
  },
};
