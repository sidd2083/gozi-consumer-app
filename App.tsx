import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
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
import { AddressSelectorModal } from './src/components/AddressSelectorModal';
import { BottomNavBar, TabName } from './src/components/BottomNavBar';
import { FloatingCartBar } from './src/components/FloatingCartBar';
import { colors } from './src/constants/theme';

function MainAppShell() {
  const { user, isAuthLoading } = useApp();

  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  // Scroll Reactive Dock Animation (Zepto Style)
  const dockAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const isDockHidden = useRef(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (currentY > 60) {
      if (diff > 8 && !isDockHidden.current) {
        isDockHidden.current = true;
        Animated.timing(dockAnim, {
          toValue: 100,
          duration: 220,
          useNativeDriver: true,
        }).start();
      } else if (diff < -8 && isDockHidden.current) {
        isDockHidden.current = false;
        Animated.timing(dockAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start();
      }
    } else if (isDockHidden.current) {
      isDockHidden.current = false;
      Animated.timing(dockAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = currentY;
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!user || !user.name || !user.addresses || user.addresses.length === 0) {
    return <OnboardingFlow onSuccess={() => setActiveTab('home')} />;
  }

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
            onScroll={handleScroll}
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

      {activeTab !== 'cart' && (
        <FloatingCartBar
          onPress={() => setActiveTab('cart')}
          translateY={dockAnim}
          bottomOffset={84}
        />
      )}

      <BottomNavBar
        currentTab={activeTab}
        translateY={dockAnim}
        onSelectTab={(tab) => {
          if (tab !== 'categories') {
            setSelectedCategoryId('');
          }
          setActiveTab(tab);
          if (isDockHidden.current) {
            isDockHidden.current = false;
            Animated.timing(dockAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }
        }}
      />

      <AddressSelectorModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
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
    backgroundColor: colors.brandGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
