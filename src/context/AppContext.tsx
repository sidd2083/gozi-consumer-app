import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserAddress, AppConfig } from '../types';
import { INITIAL_APP_CONFIG } from '../mock/mockData';
import { subscribeAppConfig } from '../services/dataService';
import { getCachedUserSession, clearUserSession, saveUserSession } from '../services/authService';

interface AppContextType {
  user: UserProfile | null;
  activeAddress: UserAddress | null;
  appConfig: AppConfig;
  isAuthLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setActiveAddress: (address: UserAddress) => void;
  logout: () => Promise<void>;
  updateUserName: (name: string) => void;
  addAddress: (address: Omit<UserAddress, 'id'>) => void;
  completeOnboarding: (user: UserProfile) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig>(INITIAL_APP_CONFIG);
  const [activeAddress, setActiveAddressState] = useState<UserAddress | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Load session from AsyncStorage
  useEffect(() => {
    async function initSession() {
      try {
        const cached = await getCachedUserSession();
        if (cached && cached.name && cached.addresses && cached.addresses.length > 0) {
          setUserState(cached);
          const defaultAddr = cached.addresses.find(a => a.id === cached.defaultAddressId) || cached.addresses[0];
          setActiveAddressState(defaultAddr);
        } else {
          setUserState(null);
          setActiveAddressState(null);
        }
      } catch (e) {
        console.warn('Session init error:', e);
      } finally {
        setIsAuthLoading(false);
      }
    }
    initSession();
  }, []);

  // Subscribe to App Config (delivery fee, store coords)
  useEffect(() => {
    const unsubscribe = subscribeAppConfig((cfg) => {
      setAppConfig(cfg);
    });
    return () => unsubscribe();
  }, []);

  const setActiveAddress = (address: UserAddress) => {
    setActiveAddressState(address);
  };

  const completeOnboarding = async (newUser: UserProfile) => {
    setUserState(newUser);
    const primary = newUser.addresses[0] || null;
    setActiveAddressState(primary);
    await saveUserSession(newUser);
  };

  const logout = async () => {
    await clearUserSession();
    setUserState(null);
    setActiveAddressState(null);
  };

  const updateUserName = (name: string) => {
    if (user) {
      const updated = { ...user, name };
      setUserState(updated);
      saveUserSession(updated);
    }
  };

  const addAddress = (addressData: Omit<UserAddress, 'id'>) => {
    if (!user) return;
    const newAddr: UserAddress = {
      ...addressData,
      id: 'addr-' + Date.now(),
    };
    const updated = {
      ...user,
      addresses: [...user.addresses, newAddr],
    };
    setUserState(updated);
    setActiveAddressState(newAddr);
    saveUserSession(updated);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeAddress,
        appConfig,
        isAuthLoading,
        setUser: setUserState,
        setActiveAddress,
        logout,
        updateUserName,
        addAddress,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
};
