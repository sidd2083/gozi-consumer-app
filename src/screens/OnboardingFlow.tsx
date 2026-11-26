import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { ArrowRight, MapPin, X, Check, Navigation, Search, CheckCircle } from 'lucide-react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { GoziLogo } from '../components/GoziLogo';
import { NepalMapIcon } from '../components/NepalMapIcon';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import {
  verifyOtpCode,
  fetchUserProfileByPhone,
  saveNewUserToFirestore,
} from '../services/authService';
import { reverseGeocodeToReadable, DARK_STORE_COORDS } from '../utils/geo';

interface OnboardingFlowProps {
  onSuccess: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onSuccess }) => {
  const { completeOnboarding } = useApp();

  const [currentStep, setCurrentStep] = useState<2 | 3 | 4>(2);
  const [loading, setLoading] = useState(false);

  // Phone input
  const [phoneNumber, setPhoneNumber] = useState('');

  // OTP input
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<any[]>([]);

  // Name & Address input
  const [fullName, setFullName] = useState('');
  const [addressText, setAddressText] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: DARK_STORE_COORDS.lat,
    lng: DARK_STORE_COORDS.lng,
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Map Picker Modal State
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 27.4287,
    longitude: 85.0331,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });
  const [pinnedCoords, setPinnedCoords] = useState({
    latitude: 27.4287,
    longitude: 85.0331,
  });
  const [tempAddressName, setTempAddressName] = useState('School Road, Hetauda-4');
  const [isGeocodingPin, setIsGeocodingPin] = useState(false);
  const mapRef = useRef<MapView | null>(null);

  // Auto-detect GPS location immediately when Step 4 is reached
  useEffect(() => {
    if (currentStep === 4) {
      autoDetectLocation();
    }
  }, [currentStep]);

  const autoDetectLocation = async () => {
    try {
      setIsDetectingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const fallbackAddress = 'School Road, Hetauda-4';
        setAddressText(fallbackAddress);
        setTempAddressName(fallbackAddress);
        setIsDetectingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      setCoords({ lat: latitude, lng: longitude });
      setPinnedCoords({ latitude, longitude });
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      });

      const humanName = await reverseGeocodeToReadable(latitude, longitude);
      setAddressText(humanName);
      setTempAddressName(humanName);
      setIsDetectingLocation(false);
    } catch (e) {
      const fallback = 'School Road, Hetauda-4';
      setAddressText(fallback);
      setTempAddressName(fallback);
      setIsDetectingLocation(false);
    }
  };

  const isValidNepaliPhone = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    return cleaned.length === 10 && (cleaned.startsWith('98') || cleaned.startsWith('97'));
  };

  const handleSendOtp = async () => {
    if (!isValidNepaliPhone(phoneNumber)) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit Nepali number starting with 98 or 97.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(3);
    }, 150);
  };

  const handleOtpChange = (text: string, index: number) => {
    const newDigits = [...otpDigits];
    newDigits[index] = text;
    setOtpDigits(newDigits);

    if (text.length > 0 && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      Alert.alert('Incomplete OTP', 'Enter all 6 digits of the code.');
      return;
    }

    if (!verifyOtpCode(code)) {
      Alert.alert('Incorrect OTP', 'Test mode code is 123456');
      return;
    }

    setLoading(true);
    const formattedPhone = `+977 ${phoneNumber}`;

    try {
      const existingUser = await fetchUserProfileByPhone(formattedPhone);
      if (existingUser && existingUser.name && existingUser.addresses && existingUser.addresses.length > 0) {
        await completeOnboarding(existingUser);
        setLoading(false);
        onSuccess();
      } else {
        setLoading(false);
        setCurrentStep(4);
      }
    } catch (e) {
      setLoading(false);
      setCurrentStep(4);
    }
  };

  // Map Region Drag / Pin Handler
  const handleRegionChangeComplete = async (region: any) => {
    setPinnedCoords({
      latitude: region.latitude,
      longitude: region.longitude,
    });
    setIsGeocodingPin(true);
    const readable = await reverseGeocodeToReadable(region.latitude, region.longitude);
    setTempAddressName(readable);
    setIsGeocodingPin(false);
  };

  const handleConfirmMapLocation = () => {
    setCoords({
      lat: pinnedCoords.latitude,
      lng: pinnedCoords.longitude,
    });
    setAddressText(tempAddressName);
    setMapModalVisible(false);
  };

  const handleConfirmProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name to proceed.');
      return;
    }
    if (!addressText.trim()) {
      Alert.alert('Address Required', 'Please provide your delivery location.');
      return;
    }

    setLoading(true);
    const formattedPhone = `+977 ${phoneNumber}`;

    try {
      const newUser = await saveNewUserToFirestore({
        fullName: fullName.trim(),
        phone: formattedPhone,
        address: {
          label: 'Home',
          fullAddress: addressText.trim(),
          landmark: '',
          lat: coords.lat,
          lng: coords.lng,
        },
      });

      await completeOnboarding(newUser);
      setLoading(false);
      onSuccess();
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Could not save profile. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Brand Header */}
      <View style={styles.header}>
        <GoziLogo size={84} />
        <Text style={styles.headerBrandText}>Gozii</Text>
        <Text style={styles.headerSubText}>Delivery in 10 mins</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 2: Phone Input (+977 with Nepal Map Outline) */}
        {currentStep === 2 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Enter Your Mobile Number</Text>
            <Text style={styles.cardSubtitle}>We will send a 6-digit verification code</Text>

            <View style={styles.phoneInputRow}>
              {/* Nepal +977 Badge with Crisp Nepal Map Vector Icon */}
              <View style={styles.prefixBox}>
                <NepalMapIcon width={24} height={16} color={colors.brandGreen} />
                <Text style={styles.prefixText}>+977</Text>
              </View>
              <TextInput
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="98XXXXXXXX"
                placeholderTextColor={colors.textMuted}
                style={styles.phoneInput}
                autoFocus
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              disabled={!isValidNepaliPhone(phoneNumber) || loading}
              style={[
                styles.primaryBtn,
                (!isValidNepaliPhone(phoneNumber) || loading) && styles.primaryBtnDisabled,
              ]}
              onPress={handleSendOtp}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.primaryBtnText}>Continue</Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: OTP Verification */}
        {currentStep === 3 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Verify OTP</Text>
            <Text style={styles.cardSubtitle}>Sent to +977 {phoneNumber}</Text>

            <View style={styles.otpGrid}>
              {otpDigits.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(ref) => {
                    otpRefs.current[idx] = ref;
                  }}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, idx)}
                  onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={[
                    styles.otpBox,
                    digit !== '' && styles.otpBoxFilled,
                  ]}
                  autoFocus={idx === 0}
                />
              ))}
            </View>

            <View style={styles.testModeBanner}>
              <CheckCircle size={15} color={colors.brandGreen} />
              <Text style={styles.testModeText}>Test OTP code: 123456</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              disabled={otpDigits.join('').length !== 6 || loading}
              style={[
                styles.primaryBtn,
                (otpDigits.join('').length !== 6 || loading) && styles.primaryBtnDisabled,
              ]}
              onPress={handleVerifyOtp}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Verify & Proceed</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setCurrentStep(2);
                setOtpDigits(['', '', '', '', '', '']);
              }}
              style={styles.backLink}
            >
              <Text style={styles.backLinkText}>Change mobile number</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 4: Full Name & Human-Readable Location */}
        {currentStep === 4 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Details</Text>
            <Text style={styles.cardSubtitle}>Set your name and delivery location</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Bishal Sharma"
              placeholderTextColor={colors.textMuted}
              style={styles.textInputField}
            />

            <Text style={styles.inputLabel}>Delivery Location</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.addressBox}
              onPress={() => setMapModalVisible(true)}
            >
              <View style={styles.addressRow}>
                <View style={styles.addressPinIconBox}>
                  <MapPin size={18} color={colors.brandGreen} />
                </View>
                <View style={styles.addressMeta}>
                  <Text numberOfLines={2} style={styles.addressText}>
                    {isDetectingLocation ? 'Detecting your address...' : (addressText || 'Tap to select location on map')}
                  </Text>
                  <Text style={styles.mapHintText}>Tap to adjust or pin on Google Maps</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              disabled={loading || !fullName.trim() || !addressText.trim()}
              style={[
                styles.primaryBtn,
                (loading || !fullName.trim() || !addressText.trim()) && styles.primaryBtnDisabled,
              ]}
              onPress={handleConfirmProfile}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Confirm & Start Shopping</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Interactive Google Map Picker Modal */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.mapModalContainer}>
          <StatusBar barStyle="dark-content" />

          {/* Modal Header */}
          <View style={styles.mapModalHeader}>
            <View>
              <Text style={styles.mapModalTitle}>Pin Delivery Location</Text>
              <Text style={styles.mapModalSub}>Move map to place pin at your door</Text>
            </View>
            <TouchableOpacity
              onPress={() => setMapModalVisible(false)}
              style={styles.closeBtn}
            >
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Interactive Map */}
          <View style={styles.interactiveMapArea}>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              initialRegion={mapRegion}
              onRegionChangeComplete={handleRegionChangeComplete}
              showsUserLocation
              showsMyLocationButton={false}
            />

            {/* Static Center Pin (Gozii Teal Green) */}
            <View style={styles.centerPinContainer} pointerEvents="none">
              <View style={styles.pinBubble}>
                <Text style={styles.pinBubbleText}>Order arrives here</Text>
              </View>
              <MapPin size={38} color={colors.brandGreen} />
              <View style={styles.pinShadow} />
            </View>

            {/* GPS Recenter Button */}
            <TouchableOpacity
              style={styles.recenterBtn}
              activeOpacity={0.85}
              onPress={autoDetectLocation}
            >
              <Navigation size={18} color={colors.brandGreen} />
            </TouchableOpacity>
          </View>

          {/* Address Confirmation Card */}
          <View style={styles.mapBottomCard}>
            <Text style={styles.selectedAddressLabel}>Selected Delivery Location</Text>
            <View style={styles.resolvedAddressBox}>
              <MapPin size={16} color={colors.brandGreen} style={{ marginTop: 2, marginRight: 8 }} />
              <Text style={styles.resolvedAddressText} numberOfLines={2}>
                {isGeocodingPin ? 'Pinpointing address...' : tempAddressName}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.confirmPinBtn}
              activeOpacity={0.88}
              onPress={handleConfirmMapLocation}
            >
              <Text style={styles.confirmPinBtnText}>Confirm This Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandGreen,
  },
  header: {
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 24,
  },
  headerBrandText: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubText: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.88)',
  },
  scrollBody: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  card: {
    width: '100%',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 22,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  prefixBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    paddingHorizontal: 12,
    backgroundColor: colors.canvasMuted,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 10,
    gap: 6,
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    height: 54,
    backgroundColor: colors.canvasMuted,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1.2,
  },
  primaryBtn: {
    height: 54,
    backgroundColor: colors.brandGreen,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.canvasMuted,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: colors.brandGreen,
    backgroundColor: colors.brandGreenSubtle,
  },
  testModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandGreenLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 20,
    gap: 6,
  },
  testModeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brandGreenDark,
  },
  backLink: {
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 6,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandGreen,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  textInputField: {
    height: 52,
    backgroundColor: colors.canvasMuted,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  addressBox: {
    backgroundColor: colors.canvasMuted,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 24,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressPinIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brandGreenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  addressMeta: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 19,
  },
  mapHintText: {
    fontSize: 11,
    color: colors.brandGreen,
    fontWeight: '600',
    marginTop: 2,
  },
  // Map Modal
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: '#FFFFFF',
  },
  mapModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  mapModalSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.canvasMuted,
  },
  interactiveMapArea: {
    flex: 1,
    position: 'relative',
  },
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -19,
    marginTop: -38,
    alignItems: 'center',
  },
  pinBubble: {
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 4,
  },
  pinBubbleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  pinShadow: {
    width: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: -3,
  },
  recenterBtn: {
    position: 'absolute',
    bottom: 24,
    right: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  mapBottomCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  selectedAddressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resolvedAddressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.canvasMuted,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  resolvedAddressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 19,
  },
  confirmPinBtn: {
    height: 52,
    backgroundColor: colors.brandGreen,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPinBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
