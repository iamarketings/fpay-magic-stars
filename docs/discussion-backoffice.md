# Discussion Backoffice FPay

## Contexte
Projet : FPay / Magic Stars — plateforme transactionnelle en circuit ferme (Stripe cash-in, Ed25519 ledger local).
Stack : React 19 + TypeScript + Vite 7 + TanStack Router + Tailwind v4 + shadcn/ui + recharts.

## Objectif
Construire une interface backoffice d'administration en mode sandbox/mock (pas de backend).
Route : `/backoffice` avec navigation par onglets.

---

## Decisions Finales (Architecte — 2026-06-06)

### 1. Architecture des donnees

**Decision : Nouveau contexte dedie `BackofficeProvider` dans `use-backoffice.tsx`**

Raisons :
- `FPayProvider` gere deja la logique wallet/transaction pour 3 profils simules (USER/CREATOR/MEMBER)
- Le backoffice gere des donnees systeme-wide : utilisateurs mockes additionnels, stats globales, configuration
- Separation of concerns : ne pas alourdir `use-fpay.tsx`
- Migration backend facilitee : on remplace le provider, pas les composants

**Hierarchie des providers :** `BackofficeProvider` DANS `FPayProvider`

```tsx
<QueryClientProvider>
  <FPayProvider>
    <BackofficeProvider>
      <Outlet />
      <Toaster />
    </BackofficeProvider>
  </FPayProvider>
</QueryClientProvider>
```

Le `BackofficeProvider` peut acceder a `useFPay()` via contexte pour croiser les donnees si necessaire (ex : verifier qu'un wallet existe).

**Donnees mockees :**
- **15 utilisateurs** (5 USER + 5 CREATOR + 5 MERCHANT) couvrant tous les statuts KYC (PENDING, VERIFIED, SUSPENDED)
- **30 transactions** uniformement reparties sur 30 jours pour les graphiques
- Persistance : `localStorage` pour la configuration systeme (`backoffice_config`)
- Namespace dedie : `backoffice_*` (pas de collision avec les clefs du dashboard)

**Independance des donnees :**
- Les 3 profils de `FPayProvider` (USER/CREATOR/MEMBER) ne sont PAS dans la liste backoffice
- Les 15 utilisateurs backoffice sont completement independants
- Suspendre un utilisateur backoffice n'affecte pas les profils du dashboard
- Les transactions backoffice sont generees independamment pour les graphiques

### 2. Navigation

**Decision : Onglets internes (pattern dashboard) — pas de sous-routes TanStack**

```tsx
const [tab, setTab] = useState<"overview" | "users" | "transactions" | "settings">("overview");
```

Raisons :
- Consistance avec le dashboard existant (meme pattern)
- Pas de complexite TanStack Router pour 4 onglets
- Migration future vers `/backoffice/stats`, `/backoffice/users` possible sans changer les composants

**4 onglets :**
1. **Apercu / Stats** (icon: `LayoutDashboard`) — KPIs + graphiques
2. **Utilisateurs** (icon: `Users`) — Tableau + filtres + modale detail
3. **Transactions** (icon: `ArrowLeftRight`) — Journal + filtres + tri
4. **Parametres** (icon: `Settings`) — Configuration systeme

**Lien "Retour au Dashboard" :** En bas de la sidebar, apres un `Separator`, avec icon `ArrowLeft` et texte "Dashboard Principal".

**Lien "Backoffice" dans le dashboard :** Dans `DashboardDesktop.tsx`, en bas de la navigation laterale (avant le footer), visible par tous les profils dans la sandbox.

### 3. Profil ADMIN

**Decision : PAS de profil ADMIN pour le MVP**

Raisons :
- Aucun systeme d'authentification n'existe dans le projet
- Le backoffice sandbox est accessible directement via `/backoffice` sans restriction
- Ajouter un profil ADMIN dans `use-fpay.tsx` necessiterait de modifier le type `ProfileId` et tout le state management existant
- Un badge "Sandbox Admin" dans le header suffit a distinguer le mode admin visuellement
- Dans une version future avec auth, on pourra proteger la route

### 4. Composants UI

**Decision : 100% shadcn/ui + recharts — 21st.dev optionnel**

| Composant | Source | Raison |
|---|---|---|
| Tableaux (Users, Transactions) | shadcn `Table` + `Pagination` | Deja disponible, coherent |
| Cartes KPI | shadcn `Card` + icones `lucide-react` | Simple, pas besoin de 21st.dev |
| Graphiques | `recharts` via `ChartContainer` (shadcn) | Deja dans package.json, wrapper deja code |
| Modale detail utilisateur | shadcn `Dialog` | 21st.dev optionnel si on veut un rendu plus pousse |
| Actions par ligne | shadcn `DropdownMenu` | Pattern standard d'action de tableau |
| Confirmation destructive | shadcn `AlertDialog` | Obligatoire pour suspendre un utilisateur |
| Filtres | shadcn `Select` + `Calendar`/`Popover` | Deja disponibles |
| Loading states | shadcn `Skeleton` | Fallback pour React.lazy() |
| Dark mode toggle | shadcn `Button` + icones `Moon`/`Sun` | Simple |

### 5. Sections — Ordre d'implementation

1. `use-backoffice.tsx` — BackofficeProvider + donnees mockees
2. `BackofficeLayout.tsx` — Sidebar + Header
3. `backoffice.tsx` — Route + integration layout
4. `BackofficeOverview.tsx` — 6 cartes KPI + 3 graphiques recharts
5. `BackofficeUsers.tsx` — Tableau pagine + filtres + modale detail
6. `BackofficeTransactions.tsx` — Journal pagine + filtres + tri
7. `BackofficeSettings.tsx` — Formulaire de configuration
8. Modifications `__root.tsx` + `DashboardDesktop.tsx`

### 6. Design System

**Layout :** Reprendre le pattern `DashboardDesktop` :
- Sidebar : `w-64`, fond `slate-900`, padding `px-3` (plus dense)
- Topbar : `h-20`, fond blanc, bordure `slate-200`
- Contenu : fond `#F8FAFC`, scrollable
- Badge header : "Sandbox Admin" avec icone `Shield`

**Animations :** CSS via `tw-animate-css` (deja importe dans `styles.css`)
- Sections : `animate-in fade-in slide-in-from-bottom-2 duration-300`
- Navigation sidebar : `transition-all` avec hover state
- Cartes KPI : `hover:-translate-y-0.5 hover:shadow-md` avec transition 200ms
- Pas de framer-motion

**Couleurs cartes KPI :**
| Carte | Icone | Fond icone |
|---|---|---|
| Utilisateurs | `Users` | Bleu `#1864FF` |
| Transactions | `ArrowLeftRight` | Vert `#22C55E` |
| Volume | `TrendingUp` | Violet `#A855F7` |
| Circulation | `Coins` | Ambre `#F59E0B` |
| Wallets | `Wallet` | Cyan `#06B6D4` |
| KYC | `ShieldCheck` | Emeraude `#10B981` |

**Dark mode :** Oui, avec toggle dans le header
- CSS variables dark deja definies dans `styles.css`
- Persistance dans `localStorage('backoffice_dark_mode')`
- Defaut : light
- Bascule : `document.documentElement.classList.toggle('dark')`

### 7. Cache / Performance

- Pas de TanStack Query pour les donnees mockees (state React local suffit)
- `React.lazy()` + `Suspense` pour les 4 sections (Overview, Users, Transactions, Settings)
- Fallback `<Skeleton className="h-96" />` pour chaque section
- Pas de loading states complexes : les donnees sont en memoire, chargement instantane

### 8. Notifications

- Sonner deja configure dans `__root.tsx` (`<Toaster position="top-right" richColors />`)
- `toast.success()` apres action reussie (suspension, activation, sauvegarde config)
- `toast.error()` en cas d'erreur
- `AlertDialog` AVANT toute action destructive

### 9. Sections futures (documentees, pas implementees)

- **Vouchers / Bons d'Achat** : quand la fonctionnalite sera implementee dans le dashboard
- **Audit Logs** : trail des actions admin (qui a suspendu qui, modifs config)
- **Support / Tickets** : si une fonctionnalite de support est prevue

---

## Questions Fermees

| Question | Reponse | Justification |
|---|---|---|
| Nouveau contexte ou extension ? | Nouveau `BackofficeProvider` | Separation of concerns |
| Navigation ? | Onglets internes (pattern dashboard) | Consistance, simplicite |
| Profil ADMIN ? | Non (MVP) | Pas d'auth, pas besoin |
| Nombre d'utilisateurs mockes ? | 15 (5 par role) | Couvre tous les statuts KYC |
| Donnees liees au dashboard ? | Independantes | Sandbox, pas d'impact croise |
| Graphiques interactifs ? | Non, purement informatifs | Controle du scope MVP |
| Lien backoffice dans sidebar ? | Oui, en bas (visible par tous) | Sandbox ouverte |
| Dark mode ? | Oui, toggle dans le header | CSS vars deja definies |
| 21st.dev pour composants ? | Optionnel (pas necessaire pour MVP) | shadcn suffit |
| React.lazy + Suspense ? | Oui, pour les 4 sections | Optimisation simple |
