import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Wallet, Transaction } from './types';

const KEYS = {
  account: 'fpay_account',
  wallet: (u: string) => `fpay_wallet_${u}`,
  kyc: (u: string) => `fpay_kyc_${u}`,
  balance: (u: string) => `fpay_balance_${u}`,
  txs: (u: string) => `fpay_txs_${u}`,
};

// ---- Account ----
export async function saveAccount(data: {
  email: string;
  password: string;
  username: string;
  mmOperator: string;
  mmNumber: string;
}) {
  await AsyncStorage.setItem(KEYS.account, JSON.stringify(data));
}

export async function loadAccount() {
  const raw = await AsyncStorage.getItem(KEYS.account);
  return raw ? JSON.parse(raw) : null;
}

// ---- KYC ----
export async function saveKyc(username: string, data: {
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
}) {
  await AsyncStorage.setItem(KEYS.kyc(username), JSON.stringify(data));
}

export async function loadKyc(username: string) {
  const raw = await AsyncStorage.getItem(KEYS.kyc(username));
  return raw ? JSON.parse(raw) : null;
}

// ---- Wallet (SecureStore for private key) ----
export async function saveWallet(username: string, wallet: Wallet) {
  // Keep secret in SecureStore for sensitive storage
  await SecureStore.setItemAsync(`fpay_secret_${username}`, wallet.secret);
  // Public + pin in AsyncStorage
  await AsyncStorage.setItem(KEYS.wallet(username), JSON.stringify({
    publicKey: wallet.publicKey,
    pin: wallet.pin,
  }));
}

export async function loadWallet(username: string): Promise<Wallet | null> {
  const raw = await AsyncStorage.getItem(KEYS.wallet(username));
  if (!raw) return null;
  const { publicKey, pin } = JSON.parse(raw);
  const secret = await SecureStore.getItemAsync(`fpay_secret_${username}`);
  if (!secret) return null;
  return { publicKey, secret, pin };
}

// ---- Balance ----
export async function saveBalance(username: string, balance: number) {
  await AsyncStorage.setItem(KEYS.balance(username), String(balance));
}

export async function loadBalance(username: string): Promise<number> {
  const raw = await AsyncStorage.getItem(KEYS.balance(username));
  return raw ? parseFloat(raw) : 0;
}

// ---- Transactions ----
export async function saveTransactions(username: string, txs: Transaction[]) {
  await AsyncStorage.setItem(KEYS.txs(username), JSON.stringify(txs));
}

export async function loadTransactions(username: string): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(KEYS.txs(username));
  return raw ? JSON.parse(raw) : [];
}

// ---- Clear All ----
export async function clearAll() {
  await AsyncStorage.clear();
}

// ---- Export backup data ----
export async function exportBackupData(username: string, profile: UserProfile, wallet: Wallet): Promise<string> {
  const kyc = await loadKyc(username);
  const data = {
    version: 'fpay-v1',
    username: profile.username,
    email: profile.email,
    mmOperator: profile.mmOperator,
    mmNumber: profile.mmNumber,
    firstName: kyc?.firstName || '',
    lastName: kyc?.lastName || '',
    phone: kyc?.phone || profile.phone,
    country: kyc?.country || 'Madagascar',
    publicKey: wallet.publicKey,
    secret: wallet.secret,
    pin: wallet.pin,
  };
  return JSON.stringify(data, null, 2);
}
