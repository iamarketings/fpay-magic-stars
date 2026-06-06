import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { SupabaseBackofficeService } from "../lib/api/backoffice-service";
import type { TransactionFilters as ServiceFilters } from "../lib/api/backoffice-service";
import type { MobileMoneyTransaction, ReconciliationFilters, MmProvider, MmStatus } from "../lib/api/backoffice-service";

// --- Types ---
export type BackofficeRole = "USER" | "CREATOR" | "MERCHANT";
export type KycStatus = "PENDING" | "VERIFIED" | "SUSPENDED";
export type TxType = "ACHAT" | "TRANSFERT" | "RECOMPENSE" | "PAIEMENT";
export type TxStatus = "COMPLETED" | "PENDING" | "FAILED";
export type SystemStatus = "OPERATIONAL" | "MAINTENANCE";

export interface BackofficeUser {
  id: string;
  username: string;
  email: string;
  role: BackofficeRole;
  kycStatus: KycStatus;
  firstName: string;
  lastName: string;
  phone: string;
  publicKey: string;
  soldeA: number;
  soldeB: number;
  createdAt: string;
  lastActive: string;
  isSuspended: boolean;
}

export interface BackofficeTransaction {
  id: string;
  type: TxType;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  amount: number;
  fee: number;
  date: string;
  status: TxStatus;
}

export interface SystemConfig {
  conversionRate: number;
  merchantFeePercent: number;
  transferLimit: number;
  systemStatus: SystemStatus;
  kycRequired: boolean;
}

export interface BackofficeStats {
  totalUsers: number;
  totalWallets: number;
  totalFStarCirculation: number;
  totalTransactions: number;
  volume24h: number;
  kycRate: number;
  activeUsers30d: number;
  transactionsByDay: { date: string; count: number }[];
  volumeHistory: { date: string; volume: number }[];
  balanceByRole: { role: string; total: number }[];
}

export interface TransactionFilters {
  type?: TxType | "ALL";
  status?: TxStatus | "ALL";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export type { MobileMoneyTransaction, ReconciliationFilters, MmProvider, MmStatus };

interface BackofficeContextType {
  users: BackofficeUser[];
  transactions: BackofficeTransaction[];
  stats: BackofficeStats;
  config: SystemConfig;
  isLoading: boolean;
  error: string | null;
  getUserById(id: string): BackofficeUser | undefined;
  suspendUser(id: string): void;
  activateUser(id: string): void;
  updateKycStatus(id: string, status: KycStatus): void;
  getFilteredTransactions(filters: TransactionFilters): BackofficeTransaction[];
  refreshStats(): void;
  updateConfig(partial: Partial<SystemConfig>): void;
  resetConfig(): void;
  // Mobile Money
  mmTransactions: MobileMoneyTransaction[];
  mmIsLoading: boolean;
  fetchMmTransactions(filters?: ReconciliationFilters): void;
  reconcileTransaction(id: string, userId: string): void;
  unreconcileTransaction(id: string): void;
}

const DEFAULT_CONFIG: SystemConfig = {
  conversionRate: 10,
  merchantFeePercent: 1.5,
  transferLimit: 10000,
  systemStatus: "OPERATIONAL",
  kycRequired: true,
};

function deriveStats(users: BackofficeUser[], transactions: BackofficeTransaction[]): BackofficeStats {
  const now = new Date();
  const dayMs = 86400000;

  const verified = users.filter(u => u.kycStatus === "VERIFIED").length;
  const active30d = users.filter(u => {
    const active = new Date(u.lastActive);
    return (now.getTime() - active.getTime()) < 30 * dayMs;
  }).length;

  const volume24h = transactions
    .filter(tx => (now.getTime() - new Date(tx.date).getTime()) < dayMs)
    .filter(tx => tx.status === "COMPLETED")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const transactionsByDay: { date: string; count: number }[] = [];
  const volumeHistory: { date: string; volume: number }[] = [];
  const dateMap = new Map<string, { count: number; volume: number }>();

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dateMap.set(key, { count: 0, volume: 0 });
  }

  transactions.forEach(tx => {
    const key = new Date(tx.date).toISOString().split("T")[0];
    if (dateMap.has(key)) {
      const entry = dateMap.get(key)!;
      entry.count++;
      if (tx.status === "COMPLETED") entry.volume += tx.amount;
    }
  });

  dateMap.forEach((val, date) => {
    transactionsByDay.push({ date, count: val.count });
    volumeHistory.push({ date, volume: val.volume });
  });

  const balanceByRoleMap = new Map<string, number>();
  users.forEach(u => {
    const current = balanceByRoleMap.get(u.role) || 0;
    balanceByRoleMap.set(u.role, current + u.soldeB);
  });
  const balanceByRole = Array.from(balanceByRoleMap.entries()).map(([role, total]) => ({ role, total }));

  return {
    totalUsers: users.length,
    totalWallets: users.filter(u => u.publicKey.length > 0).length,
    totalFStarCirculation: users.reduce((s, u) => s + u.soldeA, 0),
    totalTransactions: transactions.length,
    volume24h,
    kycRate: users.length > 0 ? verified / users.length : 0,
    activeUsers30d: active30d,
    transactionsByDay,
    volumeHistory,
    balanceByRole,
  };
}

// --- Context ---
const BackofficeContext = createContext<BackofficeContextType | undefined>(undefined);

export const BackofficeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<BackofficeUser[]>([]);
  const [transactions, setTransactions] = useState<BackofficeTransaction[]>([]);
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mmTransactions, setMmTransactions] = useState<MobileMoneyTransaction[]>([]);
  const [mmIsLoading, setMmIsLoading] = useState(false);

  const service = useMemo(() => {
    try {
      return new SupabaseBackofficeService(true);
    } catch (e) {
      const msg = "Impossible d'initialiser le client Supabase";
      console.warn(msg, e);
      setError(msg);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!service) { setIsLoading(false); return; }
    setIsLoading(true);
    Promise.all([
      service.getUsers(),
      service.getTransactions(),
      service.getSystemConfig(),
    ]).then(([usersData, txData, configData]) => {
      setUsers(usersData);
      setTransactions(txData);
      setConfig(configData);
      setError(null);
    }).catch(err => {
      console.error("Supabase fetch error", err);
      setError("Impossible de charger les données depuis Supabase");
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const stats = useMemo(() => deriveStats(users, transactions), [users, transactions]);

  const getUserById = useCallback((id: string) => {
    return users.find(u => u.id === id);
  }, [users]);

  const suspendUser = useCallback(async (id: string) => {
    if (!service) return;
    try {
      await service.suspendUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isSuspended: true } : u));
      toast.success("Utilisateur suspendu");
    } catch (err) {
      console.error("Supabase suspend error", err);
      toast.error("Erreur lors de la suspension");
    }
  }, [service]);

  const activateUser = useCallback(async (id: string) => {
    if (!service) return;
    try {
      await service.activateUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isSuspended: false } : u));
      toast.success("Utilisateur réactivé");
    } catch (err) {
      console.error("Supabase activate error", err);
      toast.error("Erreur lors de la réactivation");
    }
  }, [service]);

  const updateKycStatus = useCallback(async (id: string, status: KycStatus) => {
    if (!service) return;
    try {
      await service.updateUserKyc(id, status);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, kycStatus: status } : u));
      toast.success(status === "VERIFIED" ? "KYC approuvé" : status === "SUSPENDED" ? "KYC rejeté" : `KYC mis à jour : ${status}`);
    } catch (err) {
      console.error("Supabase KYC update error", err);
      toast.error("Erreur lors de la mise à jour KYC");
    }
  }, [service]);

  const getFilteredTransactions = useCallback((filters: TransactionFilters) => {
    return transactions.filter(tx => {
      if (filters.type && filters.type !== "ALL" && tx.type !== filters.type) return false;
      if (filters.status && filters.status !== "ALL" && tx.status !== filters.status) return false;
      if (filters.dateFrom && new Date(tx.date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(tx.date) > new Date(filters.dateTo)) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!tx.senderName.toLowerCase().includes(s) && !tx.recipientName.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [transactions]);

  const refreshStats = useCallback(() => {
    if (!service) return;
    toast.info("Mise à jour des données…");
    Promise.all([
      service.getUsers(),
      service.getTransactions(),
    ]).then(([usersData, txData]) => {
      setUsers(usersData);
      setTransactions(txData);
      toast.success("Données mises à jour");
    }).catch(err => {
      console.error("Supabase refresh error", err);
      toast.error("Erreur lors du rafraîchissement");
    });
  }, [service]);

  const updateConfig = useCallback((partial: Partial<SystemConfig>) => {
    if (!service) return;
    service.updateSystemConfig(partial).then(() => {
      setConfig(prev => ({ ...prev, ...partial }));
      toast.success("Configuration sauvegardée");
    }).catch(err => {
      console.error("Supabase config update error", err);
      toast.error("Erreur lors de la sauvegarde");
    });
  }, [service]);

  const resetConfig = useCallback(() => {
    if (!service) return;
    service.updateSystemConfig(DEFAULT_CONFIG).then(() => {
      setConfig(DEFAULT_CONFIG);
      toast.success("Configuration réinitialisée");
    }).catch(err => {
      console.error("Supabase config reset error", err);
      toast.error("Erreur lors de la réinitialisation");
    });
  }, [service]);

  // -- Mobile Money --

  const fetchMmTransactions = useCallback(async (filters?: ReconciliationFilters) => {
    if (!service) return;
    setMmIsLoading(true);
    try {
      const data = await service.getMobileMoneyTransactions(filters);
      setMmTransactions(data);
    } catch (err) {
      console.error("Supabase MM fetch error", err);
      toast.error("Erreur lors du chargement des transactions Mobile Money");
    } finally {
      setMmIsLoading(false);
    }
  }, [service]);

  const reconcileTransaction = useCallback(async (id: string, userId: string) => {
    if (!service) return;
    try {
      await service.reconcileTransaction(id, userId);
      setMmTransactions(prev =>
        prev.map(tx => tx.id === id ? { ...tx, reconciled: true, reconciledBy: userId, reconciledAt: new Date().toISOString() } : tx)
      );
      toast.success("Transaction rapprochée");
    } catch (err) {
      console.error("Supabase reconcile error", err);
      toast.error("Erreur lors du rapprochement");
    }
  }, [service]);

  const unreconcileTransaction = useCallback(async (id: string) => {
    if (!service) return;
    try {
      await service.unreconcileTransaction(id);
      setMmTransactions(prev =>
        prev.map(tx => tx.id === id ? { ...tx, reconciled: false, reconciledBy: null, reconciledAt: null } : tx)
      );
      toast.success("Transaction dé-rapprochée");
    } catch (err) {
      console.error("Supabase unreconcile error", err);
      toast.error("Erreur lors du dé-rapprochement");
    }
  }, [service]);

  return (
    <BackofficeContext.Provider
      value={{
        users, transactions, stats, config,
        isLoading, error,
        getUserById, suspendUser, activateUser, updateKycStatus,
        getFilteredTransactions, refreshStats, updateConfig, resetConfig,
        mmTransactions, mmIsLoading, fetchMmTransactions, reconcileTransaction, unreconcileTransaction,
      }}
    >
      {children}
    </BackofficeContext.Provider>
  );
};

export const useBackoffice = () => {
  const context = useContext(BackofficeContext);
  if (context === undefined) {
    throw new Error("useBackoffice must be used within a BackofficeProvider");
  }
  return context;
};
