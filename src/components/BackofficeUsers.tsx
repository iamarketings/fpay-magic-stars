import { useState, useMemo } from "react";
import { useBackoffice, type BackofficeUser, type BackofficeRole, type KycStatus } from "@/hooks/use-backoffice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { MoreHorizontal, Eye, Ban, CheckCircle, Copy, Search, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";

const ROLE_BADGES: Record<BackofficeRole, string> = {
  USER: "bg-blue-50 text-blue-700 border-blue-200",
  CREATOR: "bg-purple-50 text-purple-700 border-purple-200",
  MERCHANT: "bg-amber-50 text-amber-700 border-amber-200",
};

const KYC_BADGES: Record<KycStatus, string> = {
  VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  SUSPENDED: "bg-red-50 text-red-700 border-red-200",
};

const ITEMS_PER_PAGE = 10;

function RoleBadge({ role }: { role: BackofficeRole }) {
  return (
    <Badge variant="outline" className={`font-bold text-[10px] uppercase tracking-wider ${ROLE_BADGES[role]}`}>
      {role}
    </Badge>
  );
}

function KycBadge({ status }: { status: KycStatus }) {
  return (
    <Badge variant="outline" className={`font-bold text-[10px] ${KYC_BADGES[status]}`}>
      {status === "VERIFIED" ? "✅ Vérifié" : status === "PENDING" ? "⏳ En cours" : "🚫 Suspendu"}
    </Badge>
  );
}

function copyKey(key?: string) {
  if (!key) return;
  navigator.clipboard.writeText(key);
  toast.success("Clé copiée");
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-slate-900 mt-0.5">{value || "—"}</p>
    </div>
  );
}

export default function BackofficeUsers() {
  const { users, suspendUser, activateUser, updateKycStatus } = useBackoffice();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [kycFilter, setKycFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [detailUser, setDetailUser] = useState<BackofficeUser | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState<BackofficeUser | null>(null);

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (kycFilter !== "ALL" && u.kycStatus !== kycFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return [u.firstName, u.lastName, u.username, u.email].some(f => f.toLowerCase().includes(s));
      }
      return true;
    });
  }, [users, search, roleFilter, kycFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useMemo(() => { if (page > totalPages) setPage(1); }, [page, totalPages]);

  const handleSuspend = () => {
    if (!confirmSuspend) return;
    suspendUser(confirmSuspend.id);
    setConfirmSuspend(null);
    setDetailUser(null);
  };

  const handleActivate = (id: string) => {
    activateUser(id);
    setDetailUser(null);
  };

  return (
    <div>
      {/* Filters bar */}
      <div className="glass-panel rounded-2xl p-4 mb-6">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher..."
              className="pl-9 bg-slate-50 border-slate-200"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36 bg-slate-50">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="CREATOR">Creator</SelectItem>
              <SelectItem value="MERCHANT">Merchant</SelectItem>
            </SelectContent>
          </Select>
          <Select value={kycFilter} onValueChange={v => { setKycFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40 bg-slate-50">
              <SelectValue placeholder="Statut KYC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              <SelectItem value="VERIFIED">Vérifié</SelectItem>
              <SelectItem value="PENDING">En cours</SelectItem>
              <SelectItem value="SUSPENDED">Suspendu</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} résultat(s)</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Utilisateur</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Rôle</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">KYC</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Clé publique</TableHead>
              <TableHead className="text-right text-[11px] uppercase tracking-wider text-slate-500 font-bold">Solde A</TableHead>
              <TableHead className="text-right text-[11px] uppercase tracking-wider text-slate-500 font-bold">Solde B</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-slate-400">Aucun utilisateur trouvé</TableCell>
              </TableRow>
            ) : (
              paginated.map(u => (
                <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-slate-100">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-[#1864FF]/10 to-[#A855F7]/10 text-[#1864FF] font-bold">
                          {u.firstName[0]}{u.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-slate-900">{u.firstName} {u.lastName}</p>
                          {u.isSuspended && (
                            <Badge variant="destructive" className="text-[9px] h-4 px-1.5">Suspendu</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><RoleBadge role={u.role} /></TableCell>
                  <TableCell><KycBadge status={u.kycStatus} /></TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="font-mono text-xs text-slate-400 cursor-help">
                          {u.publicKey.substring(0, 12)}...
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono text-xs">{u.publicKey}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right font-bold tabular-nums text-slate-900 font-mono">
                    {u.soldeA.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold tabular-nums text-slate-900 font-mono">
                    {u.soldeB.toLocaleString()} Ar
                  </TableCell>
                  <TableCell>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => setDetailUser(u)}>
                            <Eye className="h-4 w-4 mr-2" /> Détail
                          </DropdownMenuItem>
                          {u.isSuspended ? (
                            <DropdownMenuItem onClick={() => handleActivate(u.id)}>
                              <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" /> Activer
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => setConfirmSuspend(u)} className="text-red-600">
                              <Ban className="h-4 w-4 mr-2" /> Suspendre
                            </DropdownMenuItem>
                          )}
                          {u.kycStatus === "PENDING" && (
                            <>
                              <DropdownMenuItem onClick={() => updateKycStatus(u.id, "VERIFIED")}>
                                <ShieldCheck className="h-4 w-4 mr-2 text-emerald-600" /> Approuver KYC
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateKycStatus(u.id, "SUSPENDED")} className="text-red-600">
                                <ShieldX className="h-4 w-4 mr-2" /> Rejeter KYC
                              </DropdownMenuItem>
                            </>
                          )}
                          {u.kycStatus === "VERIFIED" && (
                            <DropdownMenuItem onClick={() => updateKycStatus(u.id, "SUSPENDED")} className="text-red-600">
                              <ShieldX className="h-4 w-4 mr-2" /> Révoquer KYC
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <p className="text-xs text-slate-400">Page {page}/{totalPages}</p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={e => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""} />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                <PaginationItem key={p}>
                  <PaginationLink href="#" isActive={p === page} onClick={e => { e.preventDefault(); setPage(p); }}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={e => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : ""} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          {detailUser && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 ring-2 ring-slate-100">
                    <AvatarFallback className="bg-gradient-to-br from-[#1864FF]/10 to-[#A855F7]/10 text-[#1864FF] font-bold text-lg">
                      {detailUser.firstName[0]}{detailUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl text-slate-900">{detailUser.firstName} {detailUser.lastName}</DialogTitle>
                    <div className="flex gap-2 mt-1.5">
                      <RoleBadge role={detailUser.role} />
                      <KycBadge status={detailUser.kycStatus} />
                      {detailUser.isSuspended && <Badge variant="destructive" className="text-[10px]">Suspendu</Badge>}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informations</p>
                  <InfoRow label="Email" value={detailUser.email} />
                  <InfoRow label="Téléphone" value={detailUser.phone} />
                  <InfoRow label="Inscription" value={formatDate(detailUser.createdAt)} />
                  <InfoRow label="Dernière activité" value={formatDate(detailUser.lastActive)} />
                </div>
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Portefeuille</p>
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Clé publique</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs font-mono bg-slate-50 px-2 py-1 rounded truncate flex-1 text-slate-600">
                        {detailUser.publicKey}
                      </code>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => copyKey(detailUser.publicKey)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <InfoRow label="Solde A (F-Stars)" value={`${detailUser.soldeA.toLocaleString()} FStar`} />
                  <InfoRow label="Solde B (Gains)" value={`${detailUser.soldeB.toLocaleString()} Ar`} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <AlertDialog open={!!confirmSuspend} onOpenChange={() => setConfirmSuspend(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Suspendre {confirmSuspend?.firstName} {confirmSuspend?.lastName} ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'utilisateur ne pourra plus effectuer de transactions jusqu'à réactivation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 rounded-xl" onClick={handleSuspend}>
              Oui, suspendre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
