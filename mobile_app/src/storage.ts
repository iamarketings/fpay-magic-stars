import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Wallet } from './types';

const KEYS = {
  wallet: (u: string) => `fpay_wallet_${u}`,
};

// ---- Wallet (SecureStore for private key) ----
export async function saveWallet(userId: string, wallet: Wallet) {
  // Keep secret in SecureStore for sensitive storage
  await SecureStore.setItemAsync(`fpay_secret_${userId}`, wallet.secret);
  // Public + pin in AsyncStorage
  await AsyncStorage.setItem(KEYS.wallet(userId), JSON.stringify({
    publicKey: wallet.publicKey,
    pin: wallet.pin,
  }));
}

export async function loadWallet(userId: string): Promise<Wallet | null> {
  const raw = await AsyncStorage.getItem(KEYS.wallet(userId));
  if (!raw) return null;
  const { publicKey, pin } = JSON.parse(raw);
  const secret = await SecureStore.getItemAsync(`fpay_secret_${userId}`);
  if (!secret) return null;
  return { publicKey, secret, pin };
}

export async function clearWallet(userId: string) {
  await AsyncStorage.removeItem(KEYS.wallet(userId));
  await SecureStore.deleteItemAsync(`fpay_secret_${userId}`);
}

// ---- Clear All ----
export async function clearAll() {
  await AsyncStorage.clear();
}

// ---- Export backup data ----
export async function exportBackupData(profile: UserProfile, wallet: Wallet): Promise<string> {
  const data = {
    version: 'fpay-v2',
    username: profile.username,
    email: profile.email,
    mmOperator: profile.mmOperator,
    mmNumber: profile.mmNumber,
    name: profile.name,
    phone: profile.phone,
    publicKey: wallet.publicKey,
    secret: wallet.secret,
    pin: wallet.pin,
  };
  return JSON.stringify(data, null, 2);
}
