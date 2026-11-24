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
} from 'react-native';
import { ArrowRight, MapPin, X, Check, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';
import { GoziLogo } from '../components/GoziLogo';
import { useApp } from '../context/AppContext';
import {
  verifyOtpCode,
  fetchUserProfileByPhone,
  saveNewUserToFirestore,
} from '../services/authService';

interface OnboardingFlowProps {
  onSuccess: () => void;
}

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
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 27.4287, lng: 85.0331 });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Map Picker Modal State
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [tempSearchQuery, setTempSearchQuery] = useState('');

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
        setAddressText('Hetauda-4, School Road, Makwanpur');
        setIsDetectingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCoords({ lat: latitude, lng: longitude });

      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverse && reverse.length > 0) {
        const place = reverse[0];
        const street = place.street || place.name || '';
        const city = place.city || place.subregion || place.district || 'Hetauda';
        setAddressText(`${street}, ${city}`.trim() || 'Hetauda-4, Makwanpur');
      } else {
        setAddressText('Hetauda-4, School Road, Makwanpur');
      }
      setIsDetectingLocation(false);
    } catch (e) {
      setAddressText('Hetauda-4, School Road, Makwanpur');
      setIsDetectingLocation(false);
    }
  };

  const isValidNepaliPhone = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    return cleaned.length === 10 && (cleaned.startsWith('98') || cleaned.startsWith('97'));
  };

  const handleSendOtp = async () => {
    if (!isValidNepaliPhone(phoneNumber)) {
      Alert.alert('Invalid Number', 'Enter a 10-digit Nepali mobile number (starts with 98 or 97).');
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
      Alert.alert('Incomplete OTP', 'Enter all 6 digits.');
      return;
    }

    if (!verifyOtpCode(code)) {
      Alert.alert('Incorrect OTP', 'Test OTP: 123456');
      return;
    }

    setLoading(true);
    const formattedPhone = `+977 ${phoneNumber}`;

    try {
      const existingUser = await fetchUserProfileByPhone(formattedPhone);
      if (existingUser && existingUser.name && existingUser.addresses.length > 0) {
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

  const handleConfirmProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    if (!addressText.trim()) {
      Alert.alert('Address Required', 'Please enter your delivery address.');
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
      Alert.alert('Error', 'Could not save profile.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Brand Header */}
      <View style={styles.header}>
        <GoziLogo size={84} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 2: Phone */}
        {currentStep === 2 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Enter Mobile Number</Text>

            <View style={styles.phoneInputRow}>
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>+977</Text>
              </View>
              <TextInput
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="98XXXXXXXX"
                placeholderTextColor="#9CA3AF"
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

        {/* Step 3: OTP */}
        {currentStep === 3 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Verify OTP</Text>
            <Text style={styles.cardSubtitle}>+977 {phoneNumber}</Text>

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
              <Text style={styles.testModeText}>Test OTP: 123456</Text>
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
                <Text style={styles.primaryBtnText}>Verify</Text>
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
              <Text style={styles.backLinkText}>Edit phone number</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 4: Name & Address */}
        {currentStep === 4 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Details</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Bishal Sharma"
              placeholderTextColor="#9CA3AF"
              style={styles.textInputField}
            />

            <Text style={styles.inputLabel}>Delivery Address</Text>
            {/* Tapping opens the interactive map pin selector */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.addressBox}
              onPress={() => setMapModalVisible(true)}
            >
              <View style={styles.addressRow}>
                <MapPin size={18} color="#38B29C" />
                <View style={styles.addressMeta}>
                  <Text numberOfLines={2} style={styles.addressText}>
                    {isDetectingLocation ? 'Detecting location...' : (addressText || 'Tap to select on map')}
                  </Text>
                  <Text style={styles.mapHintText}>Tap to change or pin on map</Text>
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

      {/* Interactive Google Map Selector Modal */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <Text style={styles.mapModalTitle}>Pin Delivery Location</Text>
            <TouchableOpacity
              onPress={() => setMapModalVisible(false)}
              style={styles.closeBtn}
            >
              <X size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Interactive Map Surface View */}
          <View style={styles.interactiveMapArea}>
            <View style={styles.gridMapBackground}>
              {/* Simulated Map Visual Surface with Road Networks */}
              <View style={styles.roadHorizontal} />
              <View style={styles.roadVertical} />
              <View style={styles.darkStoreMarker}>
                <Text style={styles.darkStoreMarkerText}>Gozii Dark Store</Text>
              </View>

              {/* Pinpoint Customer Gate Pin */}
              <View style={styles.centerPinContainer}>
                <View style={styles.pinBubble}>
                  <Text style={styles.pinBubbleText}>Order arrives here</Text>
                </View>
                <MapPin size={38} color="#EF4444" />
                <View style={styles.pinShadow} />
              </View>
            </View>
          </View>

          {/* Address Edit Card in Map View */}
          <View style={styles.mapBottomCard}>
            <Text style={styles.selectedAddressLabel}>Selected Delivery Location</Text>
            <TextInput
              value={addressText}
              onChangeText={setAddressText}
              placeholder="House / Tole / Area name"
              style={styles.mapAddressInput}
            />

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.confirmLocationBtn}
              onPress={() => setMapModalVisible(false)}
            >
              <Check size={18} color="#FFFFFF" />
              <Text style={styles.confirmLocationText}>Confirm Location</Text>
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
    backgroundColor: '#38B29C', // Gozii Brand Teal Green Background
  },
  header: {
    paddingTop: 56,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    marginBottom: 18,
  },
  prefixBox: {
    backgroundColor: '#EEF2F6',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  primaryBtn: {
    backgroundColor: '#38B29C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  otpBoxFilled: {
    borderColor: '#38B29C',
    backgroundColor: '#F0FAF8',
  },
  testModeBanner: {
    backgroundColor: '#E8F7F4',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 18,
  },
  testModeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38B29C',
  },
  backLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  backLinkText: {
    fontSize: 13,
    color: '#38B29C',
    fontWeight: '700',
  },
  textInputField: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  addressBox: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  addressMeta: {
    flex: 1,
  },
  addressText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 18,
  },
  mapHintText: {
    fontSize: 11,
    color: '#38B29C',
    fontWeight: '700',
    marginTop: 3,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapModalHeader: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mapModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  interactiveMapArea: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  gridMapBackground: {
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
  darkStoreMarker: {
    position: 'absolute',
    top: 40,
    left: 30,
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  darkStoreMarkerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  centerPinContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  pinBubble: {
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  pinBubbleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  pinShadow: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginTop: -2,
  },
  mapBottomCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  selectedAddressLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  mapAddressInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  confirmLocationBtn: {
    backgroundColor: '#38B29C',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmLocationText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
