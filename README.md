# ShopCraft - React Native Ecommerce Client

A highly polished, premium, and feature-rich React Native mobile commerce application integrating with the Ecommerce REST API.

## Features

1.  **Authentication**: Complete signup and login with field-level validation, secure token storage, and automatic session restoration.
2.  **Home Feed**: Categorized filter chips, search with 300ms input debounce, 2-column product grid, infinite scroll pagination, and pull-to-refresh.
3.  **Product Details**: Image swipers, variants selection, stock badges, and synchronized Cart actions.
4.  **Cart**: Item listing, quantity steppers, item removing, and live subtotal calculations.
5.  **Checkout Flow**: Shipping addresses selector/creator, real-time Quote calculation with Coupon code discounts, Razorpay online payment integration, and COD checkout fallbacks.
6.  **Orders & Returns Tracking**: Order history list, details with timeline tracking, invoice downloads, cancellation options, and return request forms.

---

## State Management Choice

We selected **Zustand** for state management because:
- **Lightweight & High Performance**: Less boilerplate than Redux, leading to cleaner, more maintainable code (especially vital for a 4-6 hour coding test).
- **Hooks-based API**: Integrates naturally with React 18/19, making consumption inside functional components seamless.
- **Atomic updates**: Prevents unnecessary re-renders across screens.

---

## Technical Stack & Libraries

- **React Native CLI** (iOS & Android platforms)
- **Zustand** (Global state management)
- **React Navigation v6** (Stack & Tab navigation)
- **Axios** (Centralized API client with interceptors for 401 refresh token retry logic)
- **React Hook Form + Zod** (Form validations and error reporting)
- **React Native Keychain** (Secure token storage)
- **React Native Razorpay** (Online payment gateway)
- **Lucide React Native** (Polished typography icons)

---

## Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):
```env
API_BASE_URL=http://45.195.90.183:4000/api/v1
```

---

## Installation & Setup

1.  **Clone & Install dependencies**:
    ```bash
    npm install
    ```
2.  **Install iOS Pods**:
    ```bash
    cd ios && pod install && cd ..
    ```
3.  **Run on Simulator/Emulator**:
    - **iOS**:
      ```bash
      npx react-native run-ios
      ```
    - **Android**:
      ```bash
      npx react-native run-android
      ```

---

## Test Credentials

- **Email**: `buyer@test.com`
- **Password**: `Test@1234`
- **Static OTP**: `123456`
