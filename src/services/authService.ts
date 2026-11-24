import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConnected } from './firebase';
import { UserProfile, UserAddress } from '../types';

const STORAGE_KEY_USER = '@gozi_user_session';

/**
 * Clean Auth Service Layer
 * Easily swapable between Demo OTP ('123456') and real SMS OTP gateway later
 */
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

/**
 * Verify 6-digit OTP
 * Currently configured in Test Mode ('123456')
 */
export function verifyOtpCode(code: string): boolean {
  // To plug in real SMS gateway later, swap this validation call
  return code.trim() === '123456';
}

/**
 * Check if user profile already exists in Firestore users/{userId}
 */
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

/**
 * Save newly onboarded user to Firestore and local storage
 */
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
