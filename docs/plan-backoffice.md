# Plan Backoffice FPay — Version Finale

**Date :** 2026-06-06
**Agent :** Architecte (exploration exhaustive du projet)
**Statut :** Valide pour implementation
**Stack :** React 19 + TypeScript + Vite 7 + TanStack Router + Tailwind v4 + shadcn/ui + recharts + sonner

---

## 1. Route

**`/backoffice`** — fichier unique `src/routes/backoffice.tsx` avec navigation interne par onglets (pattern identique au dashboard existant).

```tsx
export const Route = createFileRoute("/backoffice")({
  component: Backoffice,
});
```

TanStack Router detecte automatiquement le fichier et regenere `routeTree.gen.ts` au prochain `bun dev`.

---

## 2. Architecture des fichiers

### Fichiers a creer (7)

```
src/
├── routes/
│   └── backoffice.tsx              ← Route + state des onglets + lazy loading
├── hooks/
│   └── use-backoffice.tsx          ← React Context + types + donnees mockees + CRUD
└── components/
    ├── BackofficeLayout.tsx        ← Sidebar + header + zone de contenu
    ├── BackofficeOverview.tsx      ← 6 KPIs + 3 graphiques recharts
    ├── BackofficeUsers.tsx         ← Tableau pagine + filtres + Dialog detail
    ├── BackofficeTransactions.tsx  ← Journal filtre et triable
    └── BackofficeSettings.tsx      ← Formulaire configuration systeme
```

### Fichiers a modifier (2)

| Fichier | Modification |
|---|---|
| `src/routes/__root.tsx` | Ajouter `<BackofficeProvider>` dans `<FPayProvider>` |
| `src/components/DashboardDesktop.tsx` | Ajouter lien "Backoffice Admin" dans la sidebar |

---

## 3. Decisions Architecturales

### 3.1 Contexte dedie : `use-backoffice.tsx`

**Raison :** `FPayProvider` gere deja la logique wallet/transaction pour 3 profils simules. Le backoffice gere des donnees systeme-wide (15 utilisateurs, stats, configuration). Separation of concerns.

**Hierarchie :**
```tsx
<QueryClientProvider>
  <FPayProvider>
    <BackofficeProvider>   {/* peut acceder a useFPay() */}
      <Outlet />
      <Toaster />
    </BackofficeProvider>
  </FPayProvider>
</QueryClientProvider>
```

### 3.2 Navigation : Onglets internes (pattern dashboard)

**Raison :** Consistance avec `DashboardDesktop.tsx`. Pas de complexite TanStack Router pour 4 onglets.

```tsx
type Tab = "overview" | "users" | "transactions" | "settings";
const [tab, setTab] = useState<Tab>("overview");
```

### 3.3 Pas de profil ADMIN

**Raison :** Aucun systeme d'authentification dans le projet. Le backoffice sandbox est accessible via `/backoffice` sans restriction. Ajouter un profil ADMIN dans `use-fpay.tsx` necessiterait de modifier le type `ProfileId`. Un badge "Sandbox Admin" dans le header distingue visuellement le mode admin.

### 3.4 Donnees independantes du dashboard

**Raison :** Sandbox. Suspendre un utilisateur backoffice n'affecte pas les 3 profils du `FPayProvider`. Les 15 utilisateurs backoffice sont distincts de USER/CREATOR/MEMBER.

### 3.5 Graphiques purement informatifs

**Raison :** Controle du scope MVP. Pas d'interaction clic-barre-filtre.

### 3.6 Dark mode : Oui, toggle dans le header

**Raison :** CSS variables deja definies dans `styles.css`. Persistance `localStorage`.

---

## 4. Interfaces TypeScript

```typescript
// Types
type BackofficeRole = "USER" | "CREATOR" | "MERCHANT";
type KycStatus = "PENDING" | "VERIFIED" | "SUSPENDED";
type TxType = "ACHAT" | "TRANSFERT" | "RECOMPENSE" | "PAIEMENT";
type TxStatus = "COMPLETED" | "PENDING" | "FAILED";
type SystemStatus = "OPERATIONAL" | "MAINTENANCE";

// --- Utilisateur backoffice ---
interface BackofficeUser {
  id: string;
  username: string;
  email: string;
  role: BackofficeRole;
  kycStatus: KycStatus;
  firstName: string;
  lastName: string;
  phone: string;
  publicKey: string;
  soldeA: number;       // F-Stars
  soldeB: number;       // Gains (Ariary)
  createdAt: string;    // ISO date
  lastActive: string;   // ISO date
  isSuspended: boolean;
}

// --- Transaction ---
interface BackofficeTransaction {
  id: string;
  type: TxType;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  amount: number;
  fee: number;
  date: string;         // ISO date
  status: TxStatus;
}

// --- Configuration systeme ---
interface SystemConfig {
  conversionRate: number;       // 1 FStar = X Ar (defaut: 10)
  merchantFeePercent: number;   // Frais marchand % (defaut: 1.5)
  transferLimit: number;        // Max FStar par transfert (defaut: 10000)
  systemStatus: SystemStatus;   // (defaut: OPERATIONAL)
  kycRequired: boolean;         // (defaut: true)
}

// --- Statistiques ---
interface BackofficeStats {
  totalUsers: number;
  totalWallets: number;
  totalFStarCirculation: number;
  totalTransactions: number;
  volume24h: number;
  kycRate: number;              // 0.0 - 1.0
  activeUsers30d: number;
  transactionsByDay: { date: string; count: number }[];
  volumeHistory: { date: string; volume: number }[];
  balanceByRole: { role: string; total: number }[];
}

// --- Filtres transactions ---
interface TransactionFilters {
  type?: TxType | "ALL";
  status?: TxStatus | "ALL";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// --- Contexte expose ---
interface BackofficeContextType {
  users: BackofficeUser[];
  transactions: BackofficeTransaction[];
  stats: BackofficeStats;
  config: SystemConfig;
  isLoading: boolean;

  getUserById(id: string): BackofficeUser | undefined;
  suspendUser(id: string): void;
  activateUser(id: string): void;
  getFilteredTransactions(filters: TransactionFilters): BackofficeTransaction[];
  refreshStats(): void;
  updateConfig(partial: Partial<SystemConfig>): void;
  resetConfig(): void;
}
```

---

## 5. Donnees mockees

### 5.1 15 utilisateurs (5 par role)

| # | Username | Role | KYC | Solde A | Solde B | Statut |
|---|---|---|---|---|---|---|
| 1 | alice.r | USER | VERIFIED | 2500 | 15000 | Actif |
| 2 | bob.m | USER | VERIFIED | 800 | 5000 | Actif |
| 3 | charlie.d | USER | PENDING | 1500 | 0 | Actif |
| 4 | diana.l | USER | VERIFIED | 3200 | 22000 | Actif |
| 5 | eve.t | USER | SUSPENDED | 0 | 0 | Suspendu |
| 6 | clara.stream | CREATOR | VERIFIED | 12000 | 85000 | Actif |
| 7 | olivia.art | CREATOR | VERIFIED | 8500 | 45000 | Actif |
| 8 | leo.vision | CREATOR | PENDING | 3000 | 12000 | Actif |
| 9 | sophie.beat | CREATOR | VERIFIED | 15000 | 95000 | Actif |
| 10 | max.wave | CREATOR | SUSPENDED | 2000 | 5000 | Suspendu |
| 11 | epicerie.anna | MERCHANT | VERIFIED | 5000 | 320000 | Actif |
| 12 | tech.shop | MERCHANT | VERIFIED | 2000 | 150000 | Actif |
| 13 | resto.mada | MERCHANT | PENDING | 1000 | 45000 | Actif |
| 14 | art.gallery | MERCHANT | VERIFIED | 3000 | 78000 | Actif |
| 15 | market.plus | MERCHANT | VERIFIED | 4500 | 210000 | Actif |

Cles publiques generees statiquement (format `FPAY_..._ED25519`).

### 5.2 30 transactions sur 30 jours

- 1 transaction par jour pendant 30 jours
- Repartition : ACHAT 40%, TRANSFERT 30%, RECOMPENSE 20%, PAIEMENT 10%
- Statuts : COMPLETED 85%, PENDING 10%, FAILED 5%
- Montants : 100 - 5000 FStar
- Frais : 1.5% pour type PAIEMENT, 0 pour les autres

### 5.3 Configuration par defaut

```typescript
const DEFAULT_CONFIG: SystemConfig = {
  conversionRate: 10,
  merchantFeePercent: 1.5,
  transferLimit: 10000,
  systemStatus: "OPERATIONAL",
  kycRequired: true,
};
```

Persistee dans `localStorage('backoffice_config')`.

### 5.4 Stats derivees (pas stockees, calculees a la volee)

- `totalUsers` : users.length (15)
- `totalWallets` : users avec publicKey non vide (15)
- `totalFStarCirculation` : sum(soldeA) = ~68 000
- `totalTransactions` : 30
- `volume24h` : sum des transactions date dans les dernieres 24h
- `kycRate` : VERIFIED / total = ~67%
- `activeUsers30d` : users avec lastActive < 30 jours
- `transactionsByDay` : count par jour (30 entries)
- `volumeHistory` : sum(amount) par jour (30 entries)
- `balanceByRole` : sum(soldeB) groupe par role

---

## 6. Composants — Specifications

### 6.1 BackofficeLayout.tsx (~150 lignes)

**Structure :**
```
┌────────────────────────────────────────────────────────┐
│ Sidebar (w-64, slate-900)    │ Header (h-20, blanc)     │
│ ┌─────────────────────────┐  │ ┌──────────────────────┐ │
│ │ Logo FPay (h-20)       │  │ │ [Dashboard > Apercu] │ │
│ ├─────────────────────────┤  │ │ Badge Sandbox Admin  │ │
│ │ Navigation (flex-1)     │  │ │ [Toggle Dark Mode]   │ │
│ │   LayoutDashboard Apercu│  │ └──────────────────────┘ │
│ │   Users Utilisateurs    │  │                           │
│ │   ArrowLeftRight Tx     │  │ Contenu scrollable        │
│ │   Settings Parametres   │  │ (flex-1 overflow-y-auto)  │
│ │                         │  │                           │
│ │ ─── Separator ───       │  │                           │
│ │ ArrowLeft Dashboard     │  │                           │
│ └─────────────────────────┘  └───────────────────────────┘
```

**Props :** `{ tab, setTab, children }`

**Details :**
- Sidebar : fond `bg-slate-900`, largeur `w-64`, padding `px-3`
- Items nav : `h-10 rounded-xl text-sm font-bold transition-all`
- Item actif : `bg-[#1864FF] text-white shadow-md shadow-[#1864FF]/20`
- Item inactif : `text-slate-400 hover:bg-slate-800 hover:text-white`
- Header : `bg-white border-b border-slate-200`, padding `px-8`
- Breadcrumb : `text-sm text-slate-500` avec `ChevronRight` separator
- Lien retour : `Separator` puis `Link to="/dashboard"` avec `ArrowLeft`

### 6.2 BackofficeOverview.tsx (~200 lignes)

**6 cartes KPI :**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
  <KpiCard icon={Users} label="Utilisateurs" value={stats.totalUsers}
            color="#1864FF" trend="+2% cette semaine" />
  <KpiCard icon={Wallet} label="Wallets" value={stats.totalWallets}
            color="#06B6D4" />
  <KpiCard icon={Coins} label="FStar en circulation"
            value={stats.totalFStarCirculation.toLocaleString()} color="#F59E0B" />
  <KpiCard icon={ArrowLeftRight} label="Transactions"
            value={stats.totalTransactions} color="#22C55E" trend="+5%" />
  <KpiCard icon={TrendingUp} label="Volume 24h"
            value={`${stats.volume24h} FStar`} color="#A855F7" />
  <KpiCard icon={ShieldCheck} label="Taux KYC"
            value={`${Math.round(stats.kycRate * 100)}%`} color="#10B981" />
</div>
```

Chaque `KpiCard` (composant interne au fichier) :
- shadcn `Card` avec `p-4`, `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`
- `flex items-start gap-4`
- Cercle icone : `h-10 w-10 rounded-lg flex items-center justify-center`
- Valeur : `text-2xl font-black tabular-nums`
- Label : `text-xs text-slate-500 mt-1`
- Tendance : `text-[10px] font-medium` avec `TrendingUp`/`TrendingDown`

**3 graphiques (grille 2 colonnes) :**
```tsx
<div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Ligne 1 : BarChart (full width) */}
  <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
    <h3 className="font-bold text-slate-900 mb-4">Transactions par jour (30j)</h3>
    <ChartContainer config={barConfig} className="aspect-[3/1]">
      <BarChart data={stats.transactionsByDay}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#1864FF" radius={[4,4,0,0]} />
      </BarChart>
    </ChartContainer>
  </div>

  {/* Ligne 2 : PieChart + LineChart */}
  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
    <h3 className="font-bold text-slate-900 mb-4">Soldes par role</h3>
    <ChartContainer config={pieConfig} className="aspect-[1/1]">
      <PieChart>
        <Pie data={stats.balanceByRole} dataKey="total" nameKey="role"
             cx="50%" cy="50%" outerRadius={80} />
        <Tooltip />
        <Legend />
      </PieChart>
    </ChartContainer>
  </div>

  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
    <h3 className="font-bold text-slate-900 mb-4">Evolution du volume</h3>
    <ChartContainer config={lineConfig} className="aspect-[2/1]">
      <LineChart data={stats.volumeHistory}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Line type="monotone" dataKey="volume" stroke="#1864FF"
              strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  </div>
</div>
```

### 6.3 BackofficeUsers.tsx (~300 lignes)

**Barre de filtres :**
```tsx
<div className="flex gap-3 mb-6 flex-wrap">
  <Input placeholder="Rechercher un utilisateur..." className="w-64" />
  <Select value={roleFilter} onValueChange={setRoleFilter}>
    <SelectTrigger className="w-36"><SelectValue placeholder="Role" /></SelectTrigger>
    <SelectContent>
      <SelectItem value="ALL">Tous les roles</SelectItem>
      <SelectItem value="USER">USER</SelectItem>
      <SelectItem value="CREATOR">CREATOR</SelectItem>
      <SelectItem value="MERCHANT">MERCHANT</SelectItem>
    </SelectContent>
  </Select>
  <Select value={kycFilter} onValueChange={setKycFilter}>
    <SelectTrigger className="w-44"><SelectValue placeholder="Statut KYC" /></SelectTrigger>
    <SelectContent>
      <SelectItem value="ALL">Tous les statuts</SelectItem>
      <SelectItem value="VERIFIED">Verified</SelectItem>
      <SelectItem value="PENDING">Pending</SelectItem>
      <SelectItem value="SUSPENDED">Suspended</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Tableau (shadcn Table) :**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Utilisateur</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>KYC</TableHead>
      <TableHead>Cle publique</TableHead>
      <TableHead className="text-right">Solde A</TableHead>
      <TableHead className="text-right">Solde B</TableHead>
      <TableHead className="w-[70px]"></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {paginatedUsers.map(user => (
      <TableRow key={user.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-blue-50 text-[#1864FF]">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
              {user.isSuspended && <Badge variant="destructive" className="text-[10px] h-4">Suspendu</Badge>}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-sm text-slate-500">{user.email}</TableCell>
        <TableCell><BackofficeRoleBadge role={user.role} /></TableCell>
        <TableCell><KycStatusBadge status={user.kycStatus} /></TableCell>
        <TableCell>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="font-mono text-xs text-slate-400 cursor-help">
                {user.publicKey.substring(0, 12)}...
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono text-xs">{user.publicKey}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell className="text-right font-bold tabular-nums">
          {user.soldeA.toLocaleString()}
        </TableCell>
        <TableCell className="text-right font-bold tabular-nums">
          {user.soldeB.toLocaleString()} Ar
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDetailUser(user)}>
                <Eye className="h-4 w-4 mr-2" /> Voir detail
              </DropdownMenuItem>
              {user.isSuspended ? (
                <DropdownMenuItem onClick={() => activateUser(user.id)}>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Activer
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setSuspendUser(user)}
                  className="text-red-600">
                  <Ban className="h-4 w-4 mr-2" /> Suspendre
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Pagination :** shadcn `Pagination`, 10 par page.

**AlertDialog pour suspension :**
```tsx
<AlertDialog open={!!suspendUser} onOpenChange={() => setSuspendUser(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Suspendre {suspendUser?.firstName} {suspendUser?.lastName} ?</AlertDialogTitle>
      <AlertDialogDescription>
        L'utilisateur ne pourra plus effectuer de transactions jusqu'a reactivation.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Annuler</AlertDialogCancel>
      <AlertDialogAction className="bg-red-600 hover:bg-red-700"
        onClick={() => { suspendUserAction(); }}>
        Oui, suspendre
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Dialog de detail utilisateur :**
```tsx
<Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback>{detailUser?.firstName[0]}{detailUser?.lastName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <DialogTitle>{detailUser?.firstName} {detailUser?.lastName}</DialogTitle>
          <div className="flex gap-2 mt-1">
            <BackofficeRoleBadge role={detailUser?.role} />
            <KycStatusBadge status={detailUser?.kycStatus} />
          </div>
        </div>
      </div>
    </DialogHeader>
    <div className="grid grid-cols-2 gap-6 py-4">
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900">Informations personnelles</h4>
        <InfoRow label="Email" value={detailUser?.email} />
        <InfoRow label="Telephone" value={detailUser?.phone} />
        <InfoRow label="Inscription" value={formatDate(detailUser?.createdAt)} />
        <InfoRow label="Derniere activite" value={formatDate(detailUser?.lastActive)} />
      </div>
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900">Portefeuille</h4>
        <div>
          <Label className="text-xs text-slate-500">Cle publique</Label>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs font-mono bg-slate-50 px-2 py-1 rounded truncate">
              {detailUser?.publicKey}
            </code>
            <Button variant="ghost" size="icon" className="h-6 w-6"
              onClick={() => copyToClipboard(detailUser?.publicKey)}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <InfoRow label="Solde A (F-Stars)" value={`${detailUser?.soldeA.toLocaleString()} FStar`} />
        <InfoRow label="Solde B (Gains)" value={`${detailUser?.soldeB.toLocaleString()} Ar`} />
      </div>
    </div>
    {/* Mini tableau 5 dernieres transactions */}
    <div className="border-t pt-4">
      <h4 className="text-sm font-bold text-slate-900 mb-2">Transactions recentes</h4>
      {/* Mini tableau */}
    </div>
  </DialogContent>
</Dialog>
```

### 6.4 BackofficeTransactions.tsx (~250 lignes)

**Filtres :**
```tsx
<div className="flex gap-3 mb-6 flex-wrap items-end">
  <Select value={typeFilter} onValueChange={setTypeFilter}>
    <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
    <SelectContent>
      <SelectItem value="ALL">Tous les types</SelectItem>
      <SelectItem value="ACHAT">Achat</SelectItem>
      <SelectItem value="TRANSFERT">Transfert P2P</SelectItem>
      <SelectItem value="RECOMPENSE">Recompense</SelectItem>
      <SelectItem value="PAIEMENT">Paiement</SelectItem>
    </SelectContent>
  </Select>
  <Select value={statusFilter} onValueChange={setStatusFilter}>
    <SelectTrigger className="w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
    <SelectContent>
      <SelectItem value="ALL">Tous les statuts</SelectItem>
      <SelectItem value="COMPLETED">Completed</SelectItem>
      <SelectItem value="PENDING">Pending</SelectItem>
      <SelectItem value="FAILED">Failed</SelectItem>
    </SelectContent>
  </Select>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-36">
        <CalendarIcon className="h-4 w-4 mr-2" />
        {dateFrom ? formatDate(dateFrom) : "Date debut"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} />
    </PopoverContent>
  </Popover>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-36">
        <CalendarIcon className="h-4 w-4 mr-2" />
        {dateTo ? formatDate(dateTo) : "Date fin"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar mode="single" selected={dateTo} onSelect={setDateTo} />
    </PopoverContent>
  </Popover>
  <Input placeholder="Rechercher..." className="w-48" />
</div>

{/* Filter chips (filtres actifs) */}
{(typeFilter !== "ALL" || statusFilter !== "ALL" || dateFrom || dateTo) && (
  <div className="flex gap-2 mb-4 flex-wrap">
    {typeFilter !== "ALL" && (
      <Badge variant="secondary" className="gap-1">
        Type: {typeFilter}
        <button onClick={() => setTypeFilter("ALL")} className="ml-1 hover:text-red-500">&times;</button>
      </Badge>
    )}
    {statusFilter !== "ALL" && (
      <Badge variant="secondary" className="gap-1">
        Statut: {statusFilter}
        <button onClick={() => setStatusFilter("ALL")} className="ml-1 hover:text-red-500">&times;</button>
      </Badge>
    )}
    <button onClick={clearFilters} className="text-xs text-[#1864FF] hover:underline">
      Tout effacer
    </button>
  </div>
)}
```

**Tableau (shadcn Table) avec tri :**
- Clic sur header de colonne triable (`onClick={handleSort('type')}`)
- Etat du tri : `{ key: string; direction: 'asc' | 'desc' }`
- Icone : `ArrowUpDown` (par defaut), `ArrowUp` (asc), `ArrowDown` (desc)
- Types avec badges colores : ACHAT=bleu, TRANSFERT=violet, RECOMPENSE=ambre, PAIEMENT=vert
- Statuts : COMPLETED=vert, PENDING=jaune, FAILED=rouge
- Pagination : 15 par page

**Compteur de resultats :**
```tsx
<p className="text-sm text-slate-500 mb-2">
  {filteredTransactions.length} transaction(s) trouvee(s)
</p>
```

### 6.5 BackofficeSettings.tsx (~150 lignes)

Decoupage en cartes thematiques :

```tsx
<div className="max-w-2xl space-y-6">
  {/* Carte 1 : Taux et Frais */}
  <Card>
    <CardHeader><CardTitle>Taux et Frais</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Taux de conversion</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">1 FStar =</span>
            <Input type="number" value={config.conversionRate} min={1}
                   onChange={e => setConfig({...config, conversionRate: +e.target.value})}
                   className="w-24" />
            <span className="text-sm text-slate-500">Ar</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Frais marchand</Label>
          <div className="flex items-center gap-2">
            <Input type="number" value={config.merchantFeePercent} min={0} max={100} step={0.1}
                   onChange={e => setConfig({...config, merchantFeePercent: +e.target.value})}
                   className="w-24" />
            <span className="text-sm text-slate-500">%</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Carte 2 : Limites */}
  <Card>
    <CardHeader><CardTitle>Limites</CardTitle></CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Label>Limite de transfert P2P</Label>
        <div className="flex items-center gap-2">
          <Input type="number" value={config.transferLimit} min={0}
                 onChange={e => setConfig({...config, transferLimit: +e.target.value})}
                 className="w-32" />
          <span className="text-sm text-slate-500">FStar</span>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Carte 3 : Statut Systeme */}
  <Card>
    <CardHeader><CardTitle>Statut Systeme</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Statut du systeme</Label>
        <Select value={config.systemStatus}
                onValueChange={v => setConfig({...config, systemStatus: v as SystemStatus})}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPERATIONAL">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Operationnel
              </div>
            </SelectItem>
            <SelectItem value="MAINTENANCE">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                Maintenance
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label>KYC obligatoire</Label>
          <p className="text-xs text-slate-500">Bloquer les utilisateurs non verifies</p>
        </div>
        <Switch checked={config.kycRequired}
                onCheckedChange={v => setConfig({...config, kycRequired: v})} />
      </div>
    </CardContent>
  </Card>

  {/* Boutons d'action */}
  <div className="flex gap-3">
    <Button onClick={handleSave}>
      <Save className="h-4 w-4 mr-2" /> Sauvegarder
    </Button>
    <Button variant="outline" onClick={handleReset}>
      Reinitialiser
    </Button>
  </div>

  {/* A propos */}
  <Card>
    <CardHeader><CardTitle>A propos</CardTitle></CardHeader>
    <CardContent>
      <div className="text-sm text-slate-500 space-y-1">
        <p><strong>FPay Backoffice</strong> v1.0.0</p>
        <p>Sandbox Mock — Juin 2026</p>
        <p>React 19 + TypeScript + Vite 7 + Tailwind v4 + shadcn/ui</p>
      </div>
    </CardContent>
  </Card>
</div>
```

### 6.6 backoffice.tsx (Route — ~50 lignes)

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState, lazy, Suspense } from "react";
import { BackofficeLayout } from "../components/BackofficeLayout";
import { Skeleton } from "../components/ui/skeleton";

const BackofficeOverview = lazy(() => import("../components/BackofficeOverview"));
const BackofficeUsers = lazy(() => import("../components/BackofficeUsers"));
const BackofficeTransactions = lazy(() => import("../components/BackofficeTransactions"));
const BackofficeSettings = lazy(() => import("../components/BackofficeSettings"));

type Tab = "overview" | "users" | "transactions" | "settings";

export const Route = createFileRoute("/backoffice")({
  component: BackofficePage,
});

function BackofficePage() {
  const [tab, setTab] = useState<Tab>("overview");

  const sectionComponents: Record<Tab, React.ReactNode> = {
    overview: <BackofficeOverview />,
    users: <BackofficeUsers />,
    transactions: <BackofficeTransactions />,
    settings: <BackofficeSettings />,
  };

  return (
    <BackofficeLayout tab={tab} setTab={setTab}>
      <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
        {sectionComponents[tab]}
      </Suspense>
    </BackofficeLayout>
  );
}
```

---

## 7. Components shadcn/ui reutilises

Tous sont deja disponibles dans `src/components/ui/` :

| Composant | Usage | Fichier source |
|---|---|---|
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | Tableaux Users et Transactions | `table.tsx` |
| `Badge` | Statuts KYC, roles, types tx | `badge.tsx` |
| `Card`, `CardHeader`, `CardTitle`, `CardContent` | Cartes KPI et Settings | `card.tsx` |
| `Button` | Tous les boutons | `button.tsx` |
| `Input` | Recherche, formulaires | `input.tsx` |
| `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue` | Filtres | `select.tsx` |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` | Modale detail utilisateur | `dialog.tsx` |
| `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction` | Confirmation suspension | `alert-dialog.tsx` |
| `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` | Actions par ligne | `dropdown-menu.tsx` |
| `Avatar`, `AvatarFallback` | Avatars utilisateurs | `avatar.tsx` |
| `Separator` | Separation groupes sidebar | `separator.tsx` |
| `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext` | Navigation pages | `pagination.tsx` |
| `Calendar` | Date picker filtres | `calendar.tsx` |
| `Popover`, `PopoverTrigger`, `PopoverContent` | Wrapper Calendar | `popover.tsx` |
| `Skeleton` | Loading states | `skeleton.tsx` |
| `Tooltip`, `TooltipProvider`, `TooltipTrigger`, `TooltipContent` | Infobulles cles publiques | `tooltip.tsx` |
| `Switch` | Toggle KYC obligatoire | `switch.tsx` |
| `Label` | Labels de formulaire | `label.tsx` |
| `ChartContainer`, `ChartTooltip`, `ChartLegend` | Wrapper recharts | `chart.tsx` |

---

## 8. Animations et transitions

- Sections onglets : `animate-in fade-in slide-in-from-bottom-2 duration-300`
- Items sidebar : `transition-all` avec hover state
- Cartes KPI : `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`
- Dialog : animation par defaut de shadcn (zoom + fade)

Pas de framer-motion. `tw-animate-css` deja importe dans `styles.css`.

---

## 9. Implementation — Ordre et effort

### Phase 1 : Fondation (3 fichiers, ~4h)

| Ordre | Fichier | Effort | Contenu |
|---|---|---|---|
| 1 | `src/hooks/use-backoffice.tsx` | ~2h | Types, 15 users mockes, 30 transactions, stats derivees, fonctions CRUD, configuration, localStorage |
| 2 | `src/components/BackofficeLayout.tsx` | ~1h | Sidebar + header + breadcrumb + badge + toggle dark mode |
| 3 | `src/routes/backoffice.tsx` | ~30min | Route TanStack + state tabs + lazy loading |

### Phase 2 : Sections (4 fichiers, ~7h)

| Ordre | Fichier | Effort | Contenu |
|---|---|---|---|
| 4 | `src/components/BackofficeOverview.tsx` | ~2h | 6 KPI cards + BarChart + PieChart + LineChart |
| 5 | `src/components/BackofficeUsers.tsx` | ~2.5h | Tableau + filtres + pagination + DropdownMenu + Dialog detail + AlertDialog suspension |
| 6 | `src/components/BackofficeTransactions.tsx` | ~1.5h | Tableau + filtres type/statut/date + tri colonnes + pagination + filter chips |
| 7 | `src/components/BackofficeSettings.tsx` | ~1h | 3 cartes thematiques + Switch + Select + boutons save/reset + a propos |

### Phase 3 : Integration (2 fichiers, ~30min)

| Ordre | Fichier | Effort | Modification |
|---|---|---|---|
| 8 | `src/routes/__root.tsx` | ~15min | Ajouter `import { BackofficeProvider }` + wrapper dans le render |
| 9 | `src/components/DashboardDesktop.tsx` | ~15min | Ajouter `import { Link }` + bouton "Backoffice Admin" dans sidebar (avant le footer, apres Separator) |

**Effort total estime : ~12h**

---

## 10. Verification post-implementation

1. `bun dev` demarre sans erreur
2. Route `/backoffice` accessible, layout correct (sidebar + header)
3. Navigation entre les 4 onglets fonctionne
4. Cartes KPI affichent les bonnes valeurs
5. Graphiques recharts rendus sans erreur
6. Tableau Users : filtres par role et KYC fonctionnent
7. Tableau Users : pagination (10/page)
8. Tableau Users : DropdownMenu actions affiche Voir detail / Suspendre
9. Dialog detail utilisateur : toutes les infos presentes
10. AlertDialog suspension : confirmation + toast + mise a jour statut
11. Tableau Transactions : filtres type/statut/date fonctionnent
12. Tableau Transactions : tri par colonne (asc/desc)
13. Tableau Transactions : pagination (15/page)
14. Settings : modification + sauvegarde + toast
15. Dark mode toggle fonctionne
16. Lien "Dashboard Principal" dans sidebar → navigation vers `/dashboard`
17. Lien "Backoffice Admin" dans DashboardDesktop → navigation vers `/backoffice`
18. Console : aucun warning ou erreur React/TypeScript

---

## 11. Notes techniques

- **routeTree.gen.ts** : se regenere automatiquement au `bun dev` suivant la creation de `backoffice.tsx`
- **localStorage** : namespace `backoffice_*` pour eviter les collisions avec les cles du dashboard (`fpay_*`)
- **Alias `@/`** : deja configure dans Vite pour les imports (`import X from "@/components/ui/button"`)
- **Icons** : `lucide-react` deja dans package.json. Nouvelles icons a importer : `LayoutDashboard`, `MoreHorizontal`, `Eye`, `Ban`, `CheckCircle`, `CalendarIcon`, `Save`, `Coins`, `TrendingUp`, `TrendingDown`
- **Types sans collision** : prefixe `Backoffice*` (`BackofficeUser`, `BackofficeTransaction`) pour differencier des types de `use-fpay.tsx` (`Profile`, `Transaction`)
