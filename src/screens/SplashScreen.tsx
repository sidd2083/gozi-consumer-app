import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { GoziLogo } from '../components/GoziLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <GoziLogo size={140} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#38B29C', // Gozii Brand Teal Green
    alignItems: 'center',
    justifyContent: 'center',
  },
});
