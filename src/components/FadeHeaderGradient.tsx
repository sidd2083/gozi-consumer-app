import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

interface FadeHeaderGradientProps {
  height?: number;
}

/**
 * Blinkit-Style Smooth Top-to-Bottom Fade:
 * Starts with Gozii logo teal-green (#27A98C) at top and fades smoothly downward
 * into clean white (#FFFFFF) with a soft cozy tint transition.
 */
export const FadeHeaderGradient: React.FC<FadeHeaderGradientProps> = ({
  height = 190,
}) => {
  return (
    <View style={[styles.container, { height }]} pointerEvents="none">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="goziiTopFade" x1="0" y1="0" x2="0" y2="1">
            {/* Top Gozii teal-green */}
            <Stop offset="0%" stopColor="#27A98C" stopOpacity="0.82" />
            <Stop offset="30%" stopColor="#27A98C" stopOpacity="0.48" />
            <Stop offset="65%" stopColor="#27A98C" stopOpacity="0.14" />
            <Stop offset="90%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#goziiTopFade)" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
});
