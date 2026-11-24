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
  // translateY: 0 = visible, 100 = slid down & hidden
  const dockAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const isDockHidden = useRef(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    // Only react after user has scrolled past header (y > 60)
    if (currentY > 60) {
      if (diff > 8 && !isDockHidden.current) {
        // Scrolling DOWN -> Slide dock down smoothly
        isDockHidden.current = true;
        Animated.timing(dockAnim, {
          toValue: 100,
          duration: 220,
          useNativeDriver: true,
        }).start();
      } else if (diff < -8 && isDockHidden.current) {
        // Scrolling UP -> Slide dock back up smoothly
        isDockHidden.current = false;
        Animated.timing(dockAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start();
      }
    } else if (isDockHidden.current) {
      // Near top of screen -> Always reveal dock
      isDockHidden.current = false;
      Animated.timing(dockAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = currentY;
  };

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

  // 4. Overlays: Profile
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

  // 5. Overlays: Search
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

  // 6. Overlays: Live Order Tracking
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

      {/* Coordinated Floating Cart Summary Bar (slides with dock) */}
      {activeTab !== 'cart' && (
        <FloatingCartBar
          onPress={() => setActiveTab('cart')}
          translateY={dockAnim}
          bottomOffset={84}
        />
      )}

      {/* Floating Curved Pill Bottom Dock Menu */}
      <BottomNavBar
        currentTab={activeTab}
        translateY={dockAnim}
        onSelectTab={(tab) => {
          if (tab !== 'categories') {
            setSelectedCategoryId('');
          }
          setActiveTab(tab);
          // Show dock if switched
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

      {/* Address Selector Modal */}
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
    backgroundColor: '#38B29C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
