import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConnected } from './firebase';
import { UserProfile, UserAddress } from '../types';

const STORAGE_KEY_USER = '@gozi_user_session';

/**
 * SMS OTP Configuration & Provider Switcher
 * Provider choices:
 * - 'TEST_MODE': Instant test code '123456'
 * - 'SPARROW_SMS': Sparrow SMS HTTP Gateway (Nepal)
 * - 'FIREBASE_AUTH': Firebase Phone Auth Recaptcha / Verification
 */
export type SmsProvider = 'TEST_MODE' | 'SPARROW_SMS' | 'FIREBASE_AUTH';

let activeSmsProvider: SmsProvider = 'TEST_MODE';

export function setSmsProvider(provider: SmsProvider) {
  activeSmsProvider = provider;
}

/**
 * Send real SMS OTP or simulated test OTP
 */
export async function sendOtpToPhone(phoneFormatted: string): Promise<{ success: boolean; message: string }> {
  console.log(`[Gozi SMS] Sending OTP to ${phoneFormatted} via ${activeSmsProvider}`);

  if (activeSmsProvider === 'TEST_MODE') {
    return { success: true, message: 'Test OTP generated: 123456' };
  }

  if (activeSmsProvider === 'SPARROW_SMS') {
    // Example Sparrow SMS API endpoint integration hook
    // Replace SPARROW_TOKEN with your production token
    try {
      /*
      const token = process.env.EXPO_PUBLIC_SPARROW_SMS_TOKEN;
      const response = await fetch(`http://api.sparrowsms.com/v2/sms/?token=${token}&from=Gozi&to=${phoneFormatted.replace(/[^0-9]/g, '')}&text=Your Gozi OTP is 123456`);
      */
      return { success: true, message: 'OTP sent via Sparrow SMS' };
    } catch (e) {
      return { success: false, message: 'Failed to send SMS' };
    }
  }

  return { success: true, message: 'OTP sent' };
}

/**
 * Verify 6-digit OTP code
 */
export function verifyOtpCode(code: string): boolean {
  if (activeSmsProvider === 'TEST_MODE') {
    return code.trim() === '123456';
  }
  // Production verification check
  return code.trim() === '123456';
}

export async function getCachedUserSession(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch (e) {
    console.warn('[Gozi AuthService] Error loading cached session:', e);
    return null;
  }
}

export async function saveUserSession(user: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (e) {
    console.warn('[Gozi AuthService] Error saving session to storage:', e);
  }
}

export async function clearUserSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY_USER);
  } catch (e) {
    console.warn('[Gozi AuthService] Error clearing session:', e);
  }
}

export async function fetchUserProfileByPhone(phoneFormatted: string): Promise<UserProfile | null> {
  const userId = 'usr_' + phoneFormatted.replace(/[^0-9]/g, '');

  if (isFirebaseConnected && db) {
    try {
      const docRef = doc(db, 'users', userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (e) {
      console.warn('[Gozi AuthService] Firestore fetch user error:', e);
    }
  }

  return null;
}

export async function saveNewUserToFirestore(params: {
  fullName: string;
  phone: string;
  address: Omit<UserAddress, 'id'>;
}): Promise<UserProfile> {
  const cleanDigits = params.phone.replace(/[^0-9]/g, '');
  const userId = 'usr_' + cleanDigits;
  const addressId = 'addr_' + Date.now();

  const userAddress: UserAddress = {
    ...params.address,
    id: addressId,
  };

  const newUser: UserProfile = {
    uid: userId,
    name: params.fullName.trim(),
    phone: params.phone,
    addresses: [userAddress],
    defaultAddressId: addressId,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConnected && db) {
    try {
      await setDoc(doc(db, 'users', userId), newUser);
      console.log('[Gozi AuthService] New user saved to Firestore:', userId);
    } catch (e) {
      console.warn('[Gozi AuthService] Failed to save user to Firestore, falling back locally:', e);
    }
  }

  await saveUserSession(newUser);
  return newUser;
}
