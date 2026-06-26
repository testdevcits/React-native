import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Auth Screens
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';

// Home Screens
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { ProductDetailScreen } from '../features/home/screens/ProductDetailScreen';

// Cart Screens
import { CartScreen } from '../features/cart/screens/CartScreen';
import { CheckoutScreen } from '../features/checkout/screens/CheckoutScreen';
import { ConfirmationScreen } from '../features/checkout/screens/ConfirmationScreen';

// Orders Screens
import { OrdersScreen } from '../features/orders/screens/OrdersScreen';
import { OrderDetailScreen } from '../features/orders/screens/OrderDetailScreen';
import { ReturnRequestScreen } from '../features/orders/screens/ReturnRequestScreen';

// Returns Screens
import { ReturnsScreen } from '../features/returns/screens/ReturnsScreen';

// Stores
import { useAuthStore } from '../features/auth/store/authStore';

// Icons Fallback / Lucide Icons
import { Home, ShoppingCart, ShoppingBag, RotateCcw } from 'lucide-react-native';
import { AppText } from '../components/AppText';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: 'bold' } }}>
    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
  </Stack.Navigator>
);

// Cart Stack
const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: 'bold' } }}>
    <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'My Cart' }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
    <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// Orders Stack
const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: 'bold' } }}>
    <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
    <Stack.Screen name="ReturnRequest" component={ReturnRequestScreen} options={{ title: 'Return Request' }} />
  </Stack.Navigator>
);

// Returns Stack
const ReturnsStack = () => (
  <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: 'bold' } }}>
    <Stack.Screen name="Returns" component={ReturnsScreen} options={{ title: 'My Returns' }} />
  </Stack.Navigator>
);

// Main Bottom Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        if (route.name === 'HomeTab') {
          return <Home color={color} size={size} />;
        } else if (route.name === 'CartTab') {
          return <ShoppingCart color={color} size={size} />;
        } else if (route.name === 'OrdersTab') {
          return <ShoppingBag color={color} size={size} />;
        } else if (route.name === 'ReturnsTab') {
          return <RotateCcw color={color} size={size} />;
        }
        return null;
      },
      tabBarActiveTintColor: '#3182CE',
      tabBarInactiveTintColor: '#A0AEC0',
      headerShown: false,
      tabBarStyle: {
        borderTopWidth: 1,
        borderColor: '#EDF2F7',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabel: ({ focused, color }) => {
        let label = '';
        if (route.name === 'HomeTab') label = 'Home';
        else if (route.name === 'CartTab') label = 'Cart';
        else if (route.name === 'OrdersTab') label = 'Orders';
        else if (route.name === 'ReturnsTab') label = 'Returns';
        
        return (
          <AppText
            variant="caption"
            color={color}
            style={{ fontSize: 10, fontWeight: focused ? 'bold' : 'normal' }}
          >
            {label}
          </AppText>
        );
      }
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeStack} />
    <Tab.Screen name="CartTab" component={CartStack} />
    <Tab.Screen name="OrdersTab" component={OrdersStack} />
    <Tab.Screen name="ReturnsTab" component={ReturnsStack} />
  </Tab.Navigator>
);

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (isLoading && !isAuthenticated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3182CE" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});
