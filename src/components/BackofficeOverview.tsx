import { useBackoffice } from "@/hooks/use-backoffice";
import { ChartContainer } from "@/components/ui/chart";
import BackofficeMap from "./BackofficeMap";
import {
  Users,
  Wallet,
  Coins,
  Activity,
  Zap,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const KPI_CARDS = [
  { key: "users", icon: Users, label: "Utilisateurs", color: "#1864FF", lightBg: "#EEF4FF" },
  { key: "wallets", icon: Wallet, label: "Wallets", color: "#0891B2", lightBg: "#ECFEFF" },
  { key: "circulation", icon: Coins, label: "FStar en circulation", color: "#D97706", lightBg: "#FFFBEB" },
  { key: "transactions", icon: Activity, label: "Transactions", color: "#059669", lightBg: "#ECFDF5" },
  { key: "volume", icon: Zap, label: "Volume 24h", color: "#7C3AED", lightBg: "#F5F3FF" },
  { key: "kyc", icon: ShieldCheck, label: "Taux KYC", color: "#0284C7", lightBg: "#F0F9FF" },
];

const PIE_COLORS = ["#1864FF", "#7C3AED", "#D97706"];
const CHART_BLUE = "#1864FF";

function KpiCard({ icon: Icon, label, value, color, lightBg, trend }: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  lightBg: string;
  trend?: { value: string; up: boolean };
}) {
  return (
    <div
      className="group relative glass-panel rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: lightBg, color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-black tabular-nums text-slate-900 font-mono">{value}</p>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
          {trend && (
            <p className={`text-[10px] font-bold mt-1.5 flex items-center gap-0.5 ${
              trend.up ? "text-emerald-600" : "text-red-500"
            }`}>
              {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`glass-panel rounded-2xl p-6 ${className}`}>
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-[#1864FF]" />
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function BackofficeOverview() {
  const { stats } = useBackoffice();

  const kpiValues: Record<string, { value: string; trend?: { value: string; up: boolean } }> = {
    users: { value: String(stats.totalUsers), trend: { value: "+2% cette semaine", up: true } },
    wallets: { value: String(stats.totalWallets) },
    circulation: { value: stats.totalFStarCirculation.toLocaleString() },
    transactions: { value: String(stats.totalTransactions), trend: { value: "+5%", up: true } },
    volume: { value: `${stats.volume24h}`, trend: { value: "FStar", up: true } },
    kyc: { value: `${Math.round(stats.kycRate * 100)}%` },
  };

  const barConfig = { count: { label: "Transactions", color: CHART_BLUE } };
  const pieConfig = {
    USER: { label: "Utilisateurs", color: PIE_COLORS[0] },
    CREATOR: { label: "Créateurs", color: PIE_COLORS[1] },
    MERCHANT: { label: "Marchands", color: PIE_COLORS[2] },
  };
  const lineConfig = { volume: { label: "Volume", color: CHART_BLUE } };

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPI_CARDS.map(k => (
          <KpiCard
            key={k.key}
            icon={k.icon}
            label={k.label}
            value={kpiValues[k.key]?.value || "—"}
            color={k.color}
            lightBg={k.lightBg}
            trend={kpiValues[k.key]?.trend}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Transactions par jour (30j)" className="lg:col-span-3">
          <ChartContainer config={barConfig} className="aspect-[3/1]">
            <BarChart data={stats.transactionsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "JetBrains Mono" }} tickFormatter={v => v.split("-").slice(1).join("/")} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
              <Bar dataKey="count" fill={CHART_BLUE} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Soldes par rôle">
          <ChartContainer config={pieConfig} className="aspect-[1/1]">
            <PieChart>
              <Pie data={stats.balanceByRole} dataKey="total" nameKey="role" cx="50%" cy="50%" outerRadius={80} label={({ role }) => role}>
                {stats.balanceByRole.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px" }} />
              <Legend />
            </PieChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Évolution du volume" className="lg:col-span-2">
          <ChartContainer config={lineConfig} className="aspect-[2/1]">
            <AreaChart data={stats.volumeHistory}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_BLUE} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "JetBrains Mono" }} tickFormatter={v => v.split("-").slice(1).join("/")} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px" }} />
              <Area type="monotone" dataKey="volume" stroke={CHART_BLUE} strokeWidth={2} fill="url(#volumeGradient)" dot={false} />
            </AreaChart>
          </ChartContainer>
        </ChartCard>
      </div>

      {/* Map */}
      <div className="max-w-lg mx-auto lg:max-w-none">
        <BackofficeMap />
      </div>
    </div>
  );
}
