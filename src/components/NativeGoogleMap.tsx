import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { MapPin } from 'lucide-react-native';

interface NativeGoogleMapProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onRegionChangeComplete?: (region: { latitude: number; longitude: number }) => void;
  markerCoordinate?: { latitude: number; longitude: number };
}

let MapView: any = null;
let Marker: any = null;

try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
} catch (e) {
  MapView = null;
}

export const NativeGoogleMap: React.FC<NativeGoogleMapProps> = ({
  initialRegion = {
    latitude: 27.4287,
    longitude: 85.0331,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  },
  onRegionChangeComplete,
  markerCoordinate,
}) => {
  // Check if native MapView is available
  if (MapView && Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          onRegionChangeComplete={(region: any) => {
            if (onRegionChangeComplete) {
              onRegionChangeComplete({
                latitude: region.latitude,
                longitude: region.longitude,
              });
            }
          }}
        >
          {markerCoordinate && Marker && (
            <Marker coordinate={markerCoordinate} />
          )}
        </MapView>

        {/* Center fixed pin indicator */}
        <View style={styles.centerPinOverlay} pointerEvents="none">
          <View style={styles.pinBubble}>
            <Text style={styles.pinBubbleText}>Move map to pin gate</Text>
          </View>
          <MapPin size={36} color="#EF4444" />
        </View>
      </View>
    );
  }

  // Fallback for Web and simulator environments
  return (
    <View style={styles.fallbackContainer}>
      <View style={styles.roadHorizontal} />
      <View style={styles.roadVertical} />
      <View style={styles.centerPinOverlay} pointerEvents="none">
        <View style={styles.pinBubble}>
          <Text style={styles.pinBubbleText}>Pin Doorstep Gate</Text>
        </View>
        <MapPin size={38} color="#EF4444" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  centerPinOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pinBubble: {
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 4,
  },
  pinBubbleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  roadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: '#CBD5E1',
  },
});
