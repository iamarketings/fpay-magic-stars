import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Transaction, UserProfile, Wallet } from '../types';
import {
  saveAccount, loadAccount, saveKyc, loadKyc,
  saveWallet, loadWallet, saveBalance, loadBalance,
  saveTransactions, loadTransactions, exportBackupData,
} from '../storage';

interface WalletContextType {
  appState: AppState;
  isLoading: boolean;
  completeOnboarding: (profile: UserProfile, wallet: Wallet) => Promise<void>;
  logout: () => void;
  addTransaction: (tx: Transaction) => Promise<void>;
  updateBalance: (newBalance: number) => Promise<void>;
  exportBackup: () => Promise<string | null>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [appState, setAppState] = useState<AppState>({
    profile: null,
    wallet: null,
    balance: 0,
    transactions: [],
    kycVerified: false,
    isLoggedIn: false,
  });

  // Auto-restore session on startup
  useEffect(() => {
    (async () => {
      try {
        const account = await loadAccount();
        if (!account?.username) return;

        const kyc = await loadKyc(account.username);
        const wallet = await loadWallet(account.username);

        if (kyc && wallet) {
          const balance = await loadBalance(account.username);
          const transactions = await loadTransactions(account.username);

          setAppState({
            profile: {
              email: account.email,
              name: `${kyc.firstName} ${kyc.lastName}`,
              phone: kyc.phone,
              username: account.username,
              avatar: account.username.substring(0, 2).toUpperCase(),
              mmOperator: account.mmOperator || 'TELMA',
              mmNumber: account.mmNumber || '',
            },
            wallet,
            balance,
            transactions,
            kycVerified: true,
            isLoggedIn: true,
          });
        }
      } catch (e) {
        console.error('Session restore error:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const completeOnboarding = async (profile: UserProfile, wallet: Wallet) => {
    await saveAccount({
      email: profile.email,
      password: '',
      username: profile.username,
      mmOperator: profile.mmOperator,
      mmNumber: profile.mmNumber,
    });
    // KYC is split from profile for compatibility
    const nameParts = profile.name.split(' ');
    await saveKyc(profile.username, {
      firstName: nameParts[0] || profile.username,
      lastName: nameParts.slice(1).join(' ') || '',
      phone: profile.phone,
      country: 'Madagascar',
    });
    await saveWallet(profile.username, wallet);
    await saveBalance(profile.username, 0);
    await saveTransactions(profile.username, []);

    setAppState({
      profile,
      wallet,
      balance: 0,
      transactions: [],
      kycVerified: true,
      isLoggedIn: true,
    });
  };

  const logout = () => {
    setAppState({
      profile: null,
      wallet: null,
      balance: 0,
      transactions: [],
      kycVerified: false,
      isLoggedIn: false,
    });
  };

  const addTransaction = async (tx: Transaction) => {
    const newTxs = [tx, ...appState.transactions];
    setAppState(prev => ({ ...prev, transactions: newTxs }));
    if (appState.profile?.username) {
      await saveTransactions(appState.profile.username, newTxs);
    }
  };

  const updateBalance = async (newBalance: number) => {
    setAppState(prev => ({ ...prev, balance: newBalance }));
    if (appState.profile?.username) {
      await saveBalance(appState.profile.username, newBalance);
    }
  };

  const exportBackup = async (): Promise<string | null> => {
    if (!appState.profile || !appState.wallet) return null;
    return exportBackupData(appState.profile.username, appState.profile, appState.wallet);
  };

  return (
    <WalletContext.Provider value={{
      appState, isLoading,
      completeOnboarding, logout,
      addTransaction, updateBalance, exportBackup,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
