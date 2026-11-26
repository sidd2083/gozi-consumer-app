import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { X, MapPin, Check, Plus, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';
import { reverseGeocodeToReadable, DARK_STORE_COORDS } from '../utils/geo';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { UserAddress } from '../types';

interface AddressSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddressSelectorModal: React.FC<AddressSelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const { user, activeAddress, setActiveAddress, addAddress } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [locating, setLocating] = useState(false);

  const handleSelect = (addr: UserAddress) => {
    setActiveAddress(addr);
    onClose();
  };

  const handleDetectGPS = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to detect doorstep GPS.');
        setLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = location.coords;
      const readable = await reverseGeocodeToReadable(coords.latitude, coords.longitude);
      setFullAddress(readable);
      setLandmark('Near Landmark');
      setLocating(false);
    } catch (e) {
      setFullAddress('School Road, Hetauda-4');
      setLandmark('Near Main Chowk');
      setLocating(false);
    }
  };

  const handleSaveNewAddress = () => {
    if (!fullAddress.trim()) {
      Alert.alert('Address Missing', 'Please enter your street address or house number.');
      return;
    }

    addAddress({
      label,
      fullAddress: fullAddress.trim(),
      landmark: landmark.trim() || 'Near Landmark',
      lat: DARK_STORE_COORDS.lat,
      lng: DARK_STORE_COORDS.lng,
    });

    setShowAddForm(false);
    setFullAddress('');
    setLandmark('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.title}>Select Delivery Address</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {!showAddForm ? (
              <>
                {/* Auto GPS Detect Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.gpsButton}
                  onPress={() => {
                    setShowAddForm(true);
                    handleDetectGPS();
                  }}
                >
                  <Navigation size={18} color={colors.brandGreen} />
                  <View style={styles.gpsMeta}>
                    <Text style={styles.gpsTitle}>Use Current Location</Text>
                    <Text style={styles.gpsSub}>
                      {locating ? 'Detecting coordinates...' : 'Auto-detect via GPS & drag pin'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Saved Address List */}
                <Text style={styles.subHeading}>Saved Doorstep Addresses</Text>
                {user?.addresses.map((addr) => {
                  const isSelected = activeAddress?.id === addr.id;
                  return (
                    <TouchableOpacity
                      key={addr.id}
                      activeOpacity={0.8}
                      style={[
                        styles.addressCard,
                        isSelected && styles.addressCardSelected,
                      ]}
                      onPress={() => handleSelect(addr)}
                    >
                      <MapPin
                        size={20}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                      <View style={styles.addressInfo}>
                        <Text style={styles.addressLabel}>{addr.label}</Text>
                        <Text numberOfLines={2} style={styles.addressFull}>
                          {addr.fullAddress} ({addr.landmark})
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.selectedCheck}>
                          <Check size={16} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}

                {/* Add New Address Trigger */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.addNewBtn}
                  onPress={() => setShowAddForm(true)}
                >
                  <Plus size={18} color={colors.primary} />
                  <Text style={styles.addNewText}>Add New Address</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Add New Address Form */
              <View style={styles.formContainer}>
                <Text style={styles.subHeading}>Doorstep Address Details</Text>

                {/* Label Selectors */}
                <View style={styles.labelTabs}>
                  {(['Home', 'Work', 'Other'] as const).map((l) => (
                    <TouchableOpacity
                      key={l}
                      onPress={() => setLabel(l)}
                      style={[
                        styles.tabBtn,
                        label === l && styles.tabBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          label === l && styles.tabTextActive,
                        ]}
                      >
                        {l}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Inputs */}
                <Text style={styles.formInputLabel}>House / Flat / Street Name</Text>
                <TextInput
                  value={fullAddress}
                  onChangeText={setFullAddress}
                  placeholder="e.g. House 14, Ward 4, Baluwatar"
                  placeholderTextColor={colors.textMuted}
                  style={styles.inputField}
                />

                <Text style={styles.formInputLabel}>Nearby Landmark</Text>
                <TextInput
                  value={landmark}
                  onChangeText={setLandmark}
                  placeholder="e.g. Opposite Prime Minister Residence"
                  placeholderTextColor={colors.textMuted}
                  style={styles.inputField}
                />

                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.saveAddressBtn}
                  onPress={handleSaveNewAddress}
                >
                  <Text style={styles.saveAddressText}>Save & Select Address</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowAddForm(false)}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelText}>Back to Saved Addresses</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 16,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: 16,
  },
  gpsMeta: {
    marginLeft: 12,
  },
  gpsTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.brandGreen,
  },
  gpsSub: {
    fontSize: 11,
    color: colors.brandGreenDark,
    marginTop: 2,
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  addressCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  addressFull: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: 6,
    marginTop: 6,
  },
  addNewText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  formContainer: {
    paddingTop: 4,
  },
  labelTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  formInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputField: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  saveAddressBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  saveAddressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
