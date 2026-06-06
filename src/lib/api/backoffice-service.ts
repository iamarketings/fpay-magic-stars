import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient, getAuthClient } from "./supabase-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Mobile Money types
// ---------------------------------------------------------------------------

export type MmProvider = "MVOLA" | "ORANGE_MONEY" | "AIRTEL_MONEY";
export type MmDirection = "INCOMING" | "OUTGOING";
export type MmStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface MobileMoneyTransaction {
  id: string;
  provider: MmProvider;
  direction: MmDirection;
  phone: string;
  amount: number;
  fee: number;
  reference: string;
  operatorReference: string | null;
  status: MmStatus;
  orderId: string | null;
  reconciled: boolean;
  reconciledAt: string | null;
  reconciledBy: string | null;
  notes: string;
  callbackReceived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationFilters {
  provider?: MmProvider | "ALL";
  status?: MmStatus | "ALL";
  reconciled?: "ALL" | "RECONCILIED" | "UNRECONCILIED";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// ---------------------------------------------------------------------------
// Interface du service (Repository Pattern)
// ---------------------------------------------------------------------------

export interface BackofficeService {
  getUsers(): Promise<BackofficeUser[]>;
  getUserById(id: string): Promise<BackofficeUser | undefined>;
  suspendUser(id: string): Promise<void>;
  activateUser(id: string): Promise<void>;
  updateUserKyc(userId: string, status: KycStatus): Promise<void>;
  getTransactions(filters?: TransactionFilters): Promise<BackofficeTransaction[]>;
  getStats(): Promise<BackofficeStats>;
  getSystemConfig(): Promise<SystemConfig>;
  updateSystemConfig(config: Partial<SystemConfig>): Promise<void>;
  getMobileMoneyTransactions(filters?: ReconciliationFilters): Promise<MobileMoneyTransaction[]>;
  reconcileTransaction(id: string, userId: string): Promise<void>;
  unreconcileTransaction(id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Mapper : ligne Supabase -> interface backoffice
// ---------------------------------------------------------------------------

interface ProfileRow {
  id: string;
  username: string;
  email: string;
  role: BackofficeRole;
  kyc_status: KycStatus;
  first_name: string;
  last_name: string;
  phone: string;
  public_key: string;
  is_suspended: boolean;
  created_at: string;
  last_active: string;
}

interface WalletRow {
  user_id: string;
  balance_a: number;
  balance_b: number;
}

interface TransactionRow {
  id: string;
  type: TxType;
  sender_id: string;
  sender_username?: string;
  recipient_id: string;
  recipient_username?: string;
  amount: number;
  fee: number;
  status: TxStatus;
  created_at: string;
}

function mapProfileToUser(profile: ProfileRow, wallet?: WalletRow): BackofficeUser {
  return {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    role: profile.role,
    kycStatus: profile.kyc_status,
    firstName: profile.first_name,
    lastName: profile.last_name,
    phone: profile.phone,
    publicKey: profile.public_key || "",
    soldeA: wallet?.balance_a ?? 0,
    soldeB: wallet?.balance_b ?? 0,
    createdAt: profile.created_at,
    lastActive: profile.last_active,
    isSuspended: profile.is_suspended,
  };
}

function mapTxToBackoffice(tx: TransactionRow): BackofficeTransaction {
  return {
    id: tx.id,
    type: tx.type,
    senderId: tx.sender_id,
    senderName: tx.sender_username || tx.sender_id,
    recipientId: tx.recipient_id,
    recipientName: tx.recipient_username || tx.recipient_id,
    amount: tx.amount,
    fee: tx.fee,
    date: tx.created_at,
    status: tx.status,
  };
}

// ---------------------------------------------------------------------------
// Row type for system_config
// ---------------------------------------------------------------------------

interface ConfigRow {
  key: string;
  value: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Implementation Supabase
// ---------------------------------------------------------------------------

export class SupabaseBackofficeService implements BackofficeService {
  private _client: SupabaseClient | null = null;
  private _useAdmin: boolean;
  private _error: string | null = null;

  constructor(useAdmin = true) {
    this._useAdmin = useAdmin;
    try {
      this._client = useAdmin ? getAuthClient() : getSupabaseClient();
    } catch (e) {
      this._error = (e as Error).message;
      console.warn("[SupabaseBackofficeService]", this._error);
    }
  }

  private get client(): SupabaseClient {
    if (!this._client) {
      throw new Error(this._error || "Supabase client not initialized");
    }
    return this._client;
  }

  get isAvailable(): boolean {
    return this._client !== null;
  }

  // -- Users --

  async getUsers(): Promise<BackofficeUser[]> {
    const { data: profiles, error: profileError } = await this.client
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profileError) throw profileError;

    const { data: wallets, error: walletError } = await this.client
      .from("wallets")
      .select("user_id, balance_a, balance_b");

    if (walletError) throw walletError;

    const walletMap = new Map<string, WalletRow>();
    (wallets || []).forEach((w: WalletRow) => walletMap.set(w.user_id, w));

    return (profiles || []).map((p: ProfileRow) =>
      mapProfileToUser(p, walletMap.get(p.id))
    );
  }

  async getUserById(id: string): Promise<BackofficeUser | undefined> {
    const { data: profile, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined; // not found
      throw error;
    }

    const { data: wallet } = await this.client
      .from("wallets")
      .select("balance_a, balance_b")
      .eq("user_id", id)
      .single();

    return mapProfileToUser(profile as ProfileRow, wallet as WalletRow | undefined);
  }

  async suspendUser(id: string): Promise<void> {
    const { error } = await this.client
      .from("profiles")
      .update({ is_suspended: true } as any)
      .eq("id", id);

    if (error) throw error;
  }

  async activateUser(id: string): Promise<void> {
    const { error } = await this.client
      .from("profiles")
      .update({ is_suspended: false } as any)
      .eq("id", id);

    if (error) throw error;
  }

  async updateUserKyc(userId: string, status: KycStatus): Promise<void> {
    const { error } = await this.client
      .from("profiles")
      .update({ kyc_status: status } as any)
      .eq("id", userId);

    if (error) throw error;
  }

  // -- Transactions --

  async getTransactions(filters?: TransactionFilters): Promise<BackofficeTransaction[]> {
    let query = this.client
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.type && filters.type !== "ALL") {
      query = query.eq("type", filters.type);
    }
    if (filters?.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status);
    }
    if (filters?.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    let txs = (data || []).map((tx: TransactionRow) => mapTxToBackoffice(tx));

    // Filtre search en memoire (car on doit chercher dans les noms)
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      txs = txs.filter(
        (tx) =>
          tx.senderName.toLowerCase().includes(s) ||
          tx.recipientName.toLowerCase().includes(s)
      );
    }

    return txs;
  }

  // -- Stats --

  async getStats(): Promise<BackofficeStats> {
    const [users, transactions] = await Promise.all([
      this.getUsers(),
      this.getTransactions(),
    ]);

    const now = new Date();
    const dayMs = 86400000;

    const verified = users.filter((u) => u.kycStatus === "VERIFIED").length;
    const active30d = users.filter((u) => {
      const active = new Date(u.lastActive);
      return now.getTime() - active.getTime() < 30 * dayMs;
    }).length;

    const volume24h = transactions
      .filter((tx) => tx.status === "COMPLETED" && now.getTime() - new Date(tx.date).getTime() < dayMs)
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Transactions par jour (30 derniers jours)
    const dateMap = new Map<string, { count: number; volume: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateMap.set(d.toISOString().split("T")[0], { count: 0, volume: 0 });
    }

    transactions.forEach((tx) => {
      const key = new Date(tx.date).toISOString().split("T")[0];
      if (dateMap.has(key)) {
        const entry = dateMap.get(key)!;
        entry.count++;
        if (tx.status === "COMPLETED") entry.volume += tx.amount;
      }
    });

    const transactionsByDay: { date: string; count: number }[] = [];
    const volumeHistory: { date: string; volume: number }[] = [];
    dateMap.forEach((val, date) => {
      transactionsByDay.push({ date, count: val.count });
      volumeHistory.push({ date, volume: val.volume });
    });

    // Soldes par role
    const balanceByRoleMap = new Map<string, number>();
    users.forEach((u) => {
      const current = balanceByRoleMap.get(u.role) || 0;
      balanceByRoleMap.set(u.role, current + u.soldeB);
    });
    const balanceByRole = Array.from(balanceByRoleMap.entries()).map(([role, total]) => ({
      role,
      total,
    }));

    return {
      totalUsers: users.length,
      totalWallets: users.length,
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

  // -- Config --

  async getSystemConfig(): Promise<SystemConfig> {
    const { data, error } = await this.client
      .from("system_config")
      .select("key, value");

    if (error) throw error;

    const rows = (data || []) as ConfigRow[];
    const configMap = new Map(rows.map((r) => [r.key, r.value]));

    return {
      conversionRate: (configMap.get("conversion_rate") as any)?.rate ?? 10,
      merchantFeePercent: (configMap.get("merchant_fee") as any)?.percent ?? 1.5,
      transferLimit: (configMap.get("transfer_limit") as any)?.max ?? 10000,
      systemStatus: (configMap.get("system_status") as any)?.status ?? "OPERATIONAL",
      kycRequired: (configMap.get("kyc_required") as any)?.required ?? true,
    };
  }

  async updateSystemConfig(config: Partial<SystemConfig>): Promise<void> {
    const updates: { key: string; value: Record<string, unknown> }[] = [];

    if (config.conversionRate !== undefined) {
      updates.push({ key: "conversion_rate", value: { rate: config.conversionRate } });
    }
    if (config.merchantFeePercent !== undefined) {
      updates.push({ key: "merchant_fee", value: { percent: config.merchantFeePercent } });
    }
    if (config.transferLimit !== undefined) {
      updates.push({ key: "transfer_limit", value: { max: config.transferLimit } });
    }
    if (config.systemStatus !== undefined) {
      updates.push({ key: "system_status", value: { status: config.systemStatus } });
    }
    if (config.kycRequired !== undefined) {
      updates.push({ key: "kyc_required", value: { required: config.kycRequired } });
    }

    const errors: Error[] = [];
    for (const update of updates) {
      const { error } = await this.client
        .from("system_config")
        .update({ value: update.value } as any)
        .eq("key", update.key);

      if (error) errors.push(error);
    }

    if (errors.length > 0) throw errors[0];
  }

  // -- Mobile Money --

  async getMobileMoneyTransactions(filters?: ReconciliationFilters): Promise<MobileMoneyTransaction[]> {
    let query = this.client
      .from("mobile_money_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.provider && filters.provider !== "ALL") {
      query = query.eq("provider", filters.provider);
    }
    if (filters?.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status);
    }
    if (filters?.reconciled === "RECONCILIED") {
      query = query.eq("reconciled", true);
    } else if (filters?.reconciled === "UNRECONCILIED") {
      query = query.eq("reconciled", false);
    }
    if (filters?.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    let txs = ((data || []) as Record<string, unknown>[]).map(mapMmToBackoffice);

    if (filters?.search) {
      const s = filters.search.toLowerCase();
      txs = txs.filter(
        (tx) =>
          tx.phone.toLowerCase().includes(s) ||
          tx.reference.toLowerCase().includes(s) ||
          (tx.operatorReference || "").toLowerCase().includes(s)
      );
    }

    return txs;
  }

  async reconcileTransaction(id: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from("mobile_money_transactions")
      .update({
        reconciled: true,
        reconciled_at: new Date().toISOString(),
        reconciled_by: userId,
      } as any)
      .eq("id", id);

    if (error) throw error;
  }

  async unreconcileTransaction(id: string): Promise<void> {
    const { error } = await this.client
      .from("mobile_money_transactions")
      .update({
        reconciled: false,
        reconciled_at: null,
        reconciled_by: null,
      } as any)
      .eq("id", id);

    if (error) throw error;
  }
}

// -- Mobile Money mapper --

interface MmRow {
  id: string;
  provider: MmProvider;
  direction: MmDirection;
  phone: string;
  amount: number;
  fee: number;
  reference: string;
  operator_reference: string | null;
  status: MmStatus;
  order_id: string | null;
  reconciled: boolean;
  reconciled_at: string | null;
  reconciled_by: string | null;
  notes: string;
  callback_received: boolean;
  created_at: string;
  updated_at: string;
}

function mapMmToBackoffice(row: Record<string, unknown>): MobileMoneyTransaction {
  return {
    id: row.id as string,
    provider: row.provider as MmProvider,
    direction: row.direction as MmDirection,
    phone: row.phone as string,
    amount: row.amount as number,
    fee: row.fee as number,
    reference: row.reference as string,
    operatorReference: (row.operator_reference as string) || null,
    status: row.status as MmStatus,
    orderId: (row.order_id as string) || null,
    reconciled: row.reconciled as boolean,
    reconciledAt: (row.reconciled_at as string) || null,
    reconciledBy: (row.reconciled_by as string) || null,
    notes: row.notes as string,
    callbackReceived: row.callback_received as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
