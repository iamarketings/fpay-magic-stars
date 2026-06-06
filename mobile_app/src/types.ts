export type MmOperator = 'TELMA' | 'ORANGE' | 'AIRTEL';

export type Transaction = {
  id: string;
  type: 'IN' | 'OUT' | 'REWARD' | 'BUY';
  amount: number;
  date: string;
  counterparty?: string;
  status: 'COMPLETED' | 'PENDING';
};

export type UserProfile = {
  email: string;
  name: string;
  phone: string;
  username: string;
  avatar: string;
  mmOperator: MmOperator;
  mmNumber: string;
};

export type Wallet = {
  publicKey: string;
  secret: string;
  pin: string;
};

export type AppState = {
  profile: UserProfile | null;
  wallet: Wallet | null;
  balance: number;
  transactions: Transaction[];
  kycVerified: boolean;
  isLoggedIn: boolean;
};

export type Tab = 'home' | 'buy' | 'receive' | 'send' | 'reward' | 'history' | 'profile';
