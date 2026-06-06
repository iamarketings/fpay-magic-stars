import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Transaction, UserProfile, Wallet } from '../types';
import { saveWallet, loadWallet, clearWallet, exportBackupData } from '../storage';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface WalletContextType {
  appState: AppState;
  isLoading: boolean;
  completeOnboarding: (password: string, profile: UserProfile, wallet: Wallet) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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

  const fetchUserData = async (session: Session) => {
    try {
      const { data: profileData, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (pError || !profileData) {
        throw new Error("Profil introuvable");
      }

      const wallet = await loadWallet(profileData.id);
      
      let balance = 0;
      const { data: walletData } = await supabase
        .from('wallets')
        .select('balance_a')
        .eq('user_id', profileData.id)
        .single();
      if (walletData) balance = walletData.balance_a;

      let transactions: Transaction[] = [];
      const { data: txData } = await supabase
        .from('transactions')
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

      setAppState({
        profile: {
          email: profileData.email,
          name: `${profileData.first_name} ${profileData.last_name}`.trim() || profileData.username,
          phone: profileData.phone,
          username: profileData.username,
          avatar: profileData.username.substring(0, 2).toUpperCase(),
          mmOperator: 'TELMA', // Defaulting for now
          mmNumber: profileData.phone,
        },
        wallet,
        balance,
        transactions,
        kycVerified: profileData.kyc_status === 'VERIFIED',
        isLoggedIn: true,
      });
    } catch (e) {
      console.error('Session restore error:', e);
      await supabase.auth.signOut();
      setAppState({
        profile: null, wallet: null, balance: 0, transactions: [], kycVerified: false, isLoggedIn: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserData(session);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserData(session);
      } else {
        setAppState({
          profile: null, wallet: null, balance: 0, transactions: [], kycVerified: false, isLoggedIn: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const completeOnboarding = async (password: string, profile: UserProfile, wallet: Wallet) => {
    setIsLoading(true);
    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: profile.email,
        password: password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur de création d'utilisateur");

      const userId = authData.user.id;
      const nameParts = profile.name.split(' ');
      const firstName = nameParts[0] || profile.username;
      const lastName = nameParts.slice(1).join(' ') || '';

      // 2. Insert into profiles
      const { error: pError } = await supabase.from('profiles').insert({
        id: userId,
        username: profile.username,
        email: profile.email,
        first_name: firstName,
        last_name: lastName,
        phone: profile.phone,
        public_key: wallet.publicKey,
        encrypted_private_key: wallet.secret,
        role: 'USER',
        kyc_status: 'PENDING'
      });

      if (pError) throw pError;

      // 3. Insert into wallets
      await supabase.from('wallets').insert({
        user_id: userId,
        balance_a: 0,
        balance_b: 0,
      });

      // 4. Save local Ed25519 secure material
      await saveWallet(userId, wallet);

    } catch(e) {
      console.error("Signup error:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (e) {
      console.error("Login error:", e);
      setIsLoading(false);
      throw e;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setAppState({
      profile: null, wallet: null, balance: 0, transactions: [], kycVerified: false, isLoggedIn: false
    });
    setIsLoading(false);
  };

  const addTransaction = async (tx: Transaction) => {
    // Dans une vraie app, on appelle une Edge Function Supabase pour réaliser la transaction P2P de façon atomique.
    // Pour l'instant, on enregistre simplement en base si possible.
    const newTxs = [tx, ...appState.transactions];
    setAppState(prev => ({ ...prev, transactions: newTxs }));
    
    if (appState.profile?.username) {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          await supabase.from('transactions').insert({
             type: 'TRANSFERT',
             sender_id: session.session.user.id,
             sender_username: appState.profile.username,
             recipient_id: tx.address, // Nécessite l'ID réel dans une prod
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
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
         await supabase.from('wallets').update({ balance_a: newBalance }).eq('user_id', session.session.user.id);
      }
    } catch(e) {
      console.warn("Could not update balance in Supabase", e);
    }
  };

  const exportBackup = async (): Promise<string | null> => {
    if (!appState.profile || !appState.wallet) return null;
    return exportBackupData(appState.profile, appState.wallet);
  };

  return (
    <WalletContext.Provider value={{
      appState, isLoading,
      completeOnboarding, login, logout,
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

