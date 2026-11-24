import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface GoziLogoProps {
  size?: number;
}

export const GoziLogo: React.FC<GoziLogoProps> = ({ size = 80 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={require('../../assets/images/gozi-logo.png')}
        style={[styles.logoImage, { width: size, height: size, borderRadius: size / 2 }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    backgroundColor: 'transparent',
  },
});
