import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppContextProvider, useApp } from './src/context/AppContext';
import { CartProvider } from './src/context/CartContext';
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingFlow } from './src/screens/OnboardingFlow';
import { HomeScreen } from './src/screens/HomeScreen';
import { CategoriesTabScreen } from './src/screens/CategoriesTabScreen';
import { CartScreen } from './src/screens/CartScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { OrderTrackingScreen } from './src/screens/OrderTrackingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BottomNavBar, TabName } from './src/components/BottomNavBar';
import { FloatingCartBar } from './src/components/FloatingCartBar';

function MainAppShell() {
  const { user, isAuthLoading } = useApp();

  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  // 1. Splash Screen Gate
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Auth Loading
  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38B29C" />
      </View>
    );
  }

  // 3. Onboarding Gate (Mandatory)
  if (!user || !user.name || !user.addresses || user.addresses.length === 0) {
    return <OnboardingFlow onSuccess={() => setActiveTab('home')} />;
  }

  // 4. Profile Screen
  if (profileOpen) {
    return (
      <ProfileScreen
        onBack={() => setProfileOpen(false)}
        onNavigateToTracking={(orderId: string) => {
          setProfileOpen(false);
          setTrackingOrderId(orderId);
        }}
        onNavigateToAddresses={() => setAddressModalVisible(true)}
      />
    );
  }

  // 5. Search Screen
  if (searchOpen) {
    return (
      <SearchScreen
        onBack={() => setSearchOpen(false)}
        onNavigateToCart={() => {
          setSearchOpen(false);
          setActiveTab('cart');
        }}
      />
    );
  }

  // 6. Live Tracking
  if (trackingOrderId) {
    return (
      <OrderTrackingScreen
        orderId={trackingOrderId}
        onBackToHome={() => {
          setTrackingOrderId(null);
          setActiveTab('home');
        }}
      />
    );
  }

  // 7. Tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateToCategory={(catId) => {
              setSelectedCategoryId(catId);
              setActiveTab('categories');
            }}
            onNavigateToSearch={() => setSearchOpen(true)}
            onNavigateToProfile={() => setProfileOpen(true)}
            onOpenAddressSelector={() => setAddressModalVisible(true)}
          />
        );
      case 'categories':
        return <CategoriesTabScreen initialCategoryId={selectedCategoryId} />;
      case 'cart':
        return (
          <CartScreen
            onBack={() => setActiveTab('home')}
            onOrderPlaced={(orderId) => setTrackingOrderId(orderId)}
            onOpenAddressSelector={() => setAddressModalVisible(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContent}>{renderTabContent()}</View>

      {/* Floating View Cart Pill (if items exist and not on Cart tab) */}
      {activeTab !== 'cart' && (
        <FloatingCartBar
          onPress={() => setActiveTab('cart')}
          bottomOffset={68}
        />
      )}

      {/* Persistent Bottom Nav Bar */}
      <BottomNavBar
        currentTab={activeTab}
        onSelectTab={(tab) => {
          if (tab !== 'categories') {
            setSelectedCategoryId('');
          }
          setActiveTab(tab);
        }}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContextProvider>
        <CartProvider>
          <MainAppShell />
        </CartProvider>
      </AppContextProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#38B29C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
