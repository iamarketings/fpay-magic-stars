import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Transaction, UserProfile, Wallet } from '../types';
import {
  saveAccount, loadAccount, saveKyc, loadKyc,
  saveWallet, loadWallet, saveBalance, loadBalance,
  saveTransactions, loadTransactions, exportBackupData,
} from '../storage';
import { supabase } from '../lib/supabase';

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
          // Fetch real balance from Supabase if possible
          let balance = await loadBalance(account.username);
          let transactions = await loadTransactions(account.username);
          
          try {
            const { data: profileData } = await supabase.from('profiles').select('id, kyc_status').eq('username', account.username).single();
            if (profileData) {
              const { data: walletData } = await supabase.from('wallets').select('balance_a').eq('user_id', profileData.id).single();
              if (walletData) balance = walletData.balance_a;
              
              const { data: txData } = await supabase.from('transactions')
                .select('*')
                .or(`sender_id.eq.${profileData.id},recipient_id.eq.${profileData.id}`)
                .order('created_at', { ascending: false });
                
              if (txData) {
                 transactions = txData.map((t: any) => ({
                    id: t.id,
                    type: t.sender_id === profileData.id ? 'send' : 'receive',
                    amount: t.amount,
                    address: t.sender_id === profileData.id ? t.recipient_username || t.recipient_id : t.sender_username || t.sender_id,
                    status: t.status.toLowerCase(),
                    date: t.created_at,
                    fee: t.fee,
                 }));
              }
            }
          } catch (e) {
            console.warn("Could not sync with Supabase, using local data", e);
          }

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
    
    const nameParts = profile.name.split(' ');
    const firstName = nameParts[0] || profile.username;
    const lastName = nameParts.slice(1).join(' ') || '';
    
    await saveKyc(profile.username, {
      firstName,
      lastName,
      phone: profile.phone,
      country: 'Madagascar',
    });
    await saveWallet(profile.username, wallet);
    await saveBalance(profile.username, 0);
    await saveTransactions(profile.username, []);

    try {
      const { data: pData, error: pError } = await supabase.from('profiles').insert({
        username: profile.username,
        email: profile.email,
        first_name: firstName,
        last_name: lastName,
        phone: profile.phone,
        public_key: wallet.publicKey,
        encrypted_private_key: wallet.secret, // Encrypted payload
        role: 'USER',
        kyc_status: 'PENDING'
      }).select('id').single();

      if (!pError && pData) {
        await supabase.from('wallets').insert({
          user_id: pData.id,
          balance_a: 0,
          balance_b: 0,
        });
      }
    } catch(e) {
      console.warn("Could not create Supabase profile", e);
    }

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
      
      // Sync to supabase
      try {
        const { data: profile } = await supabase.from('profiles').select('id').eq('username', appState.profile.username).single();
        if (profile) {
           await supabase.from('transactions').insert({
             type: 'TRANSFERT',
             sender_id: profile.id,
             sender_username: appState.profile.username,
             recipient_id: tx.address, // In real app, we need recipient profile id
             amount: tx.amount,
             fee: tx.fee || 0,
             status: 'COMPLETED'
           });
        }
      } catch(e) {
        console.warn("Could not sync transaction to Supabase", e);
      }
    }
  };

  const updateBalance = async (newBalance: number) => {
    setAppState(prev => ({ ...prev, balance: newBalance }));
    if (appState.profile?.username) {
      await saveBalance(appState.profile.username, newBalance);
      
      // Update wallet balance in Supabase
      try {
        const { data: profile } = await supabase.from('profiles').select('id').eq('username', appState.profile.username).single();
        if (profile) {
           await supabase.from('wallets').update({ balance_a: newBalance }).eq('user_id', profile.id);
        }
      } catch(e) {
        console.warn("Could not update balance in Supabase", e);
      }
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

