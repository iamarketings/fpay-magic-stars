import { useState, useEffect } from "react";
import { useBackoffice, type MmProvider, type MmStatus, type ReconciliationFilters } from "@/hooks/use-backoffice";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Search, CheckCircle, RotateCcw, RefreshCw, Smartphone, ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

const PROVIDER_LABELS: Record<MmProvider, string> = {
  MVOLA: "MVola",
  ORANGE_MONEY: "Orange Money",
  AIRTEL_MONEY: "Airtel Money",
};

const PROVIDER_COLORS: Record<MmProvider, string> = {
  MVOLA: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ORANGE_MONEY: "bg-orange-50 text-orange-700 border-orange-200",
  AIRTEL_MONEY: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_BADGES: Record<MmStatus, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: number) {
  return amount.toLocaleString("fr-FR") + " Ar";
}

export default function BackofficeReconciliation() {
  const {
    mmTransactions,
    mmIsLoading,
    fetchMmTransactions,
    reconcileTransaction,
    unreconcileTransaction,
  } = useBackoffice();
  const { user } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [reconciledFilter, setReconciledFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [detailTx, setDetailTx] = useState<(typeof mmTransactions)[number] | null>(null);

  // Charger au montage
  useEffect(() => {
    fetchMmTransactions();
  }, [fetchMmTransactions]);

  // Appliquer les filtres
  const applyFilters = () => {
    const filters: ReconciliationFilters = {};
    if (providerFilter !== "ALL") filters.provider = providerFilter as MmProvider;
    if (statusFilter !== "ALL") filters.status = statusFilter as MmStatus;
    if (reconciledFilter !== "ALL") filters.reconciled = reconciledFilter as "RECONCILIED" | "UNRECONCILIED";
    if (search) filters.search = search;
    fetchMmTransactions(filters);
    setPage(1);
  };

  // Pagination côté client
  const totalPages = Math.max(1, Math.ceil(mmTransactions.length / ITEMS_PER_PAGE));
  const paginated = mmTransactions.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleReconcile = (id: string) => {
    if (!user) return toast.error("Utilisateur non identifié");
    reconcileTransaction(id, user.id);
    setDetailTx(null);
  };

  const handleUnreconcile = (id: string) => {
    unreconcileTransaction(id);
    setDetailTx(null);
  };

  return (
    <div>
      {/* Filters */}
      <div className="glass-panel rounded-2xl p-4 mb-6">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Téléphone, référence..."
              className="pl-9 bg-slate-50 border-slate-200"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyFilters()}
            />
          </div>
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-36 bg-slate-50">
              <SelectValue placeholder="Opérateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              <SelectItem value="MVOLA">MVola</SelectItem>
              <SelectItem value="ORANGE_MONEY">Orange Money</SelectItem>
              <SelectItem value="AIRTEL_MONEY">Airtel Money</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-slate-50">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              <SelectItem value="SUCCESS">Succès</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="FAILED">Échoué</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reconciledFilter} onValueChange={setReconciledFilter}>
            <SelectTrigger className="w-36 bg-slate-50">
              <SelectValue placeholder="Rapprochement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              <SelectItem value="RECONCILIED">Rapproché</SelectItem>
              <SelectItem value="UNRECONCILIED">Non rapproché</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={applyFilters}
            className="rounded-xl"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Filtrer
          </Button>
          <span className="text-xs text-slate-400 ml-auto">{mmTransactions.length} résultat(s)</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Opérateur</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Type</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Téléphone</TableHead>
              <TableHead className="text-right text-[11px] uppercase tracking-wider text-slate-500 font-bold">Montant</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Statut</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Rapproché</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Date</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mmIsLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <div className="flex items-center justify-center gap-3 text-slate-400">
                    <div className="h-5 w-5 rounded-full border-2 border-[#1864FF] border-t-transparent animate-spin" />
                    <span className="text-sm">Chargement…</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-slate-400">
                  Aucune transaction Mobile Money trouvée
                </TableCell>
              </TableRow>
            ) : (
              paginated.map(tx => (
                <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell>
                    <Badge variant="outline" className={`font-bold text-[10px] uppercase tracking-wider ${PROVIDER_COLORS[tx.provider]}`}>
                      <Smartphone className="h-3 w-3 mr-1" />
                      {PROVIDER_LABELS[tx.provider]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1.5 text-sm font-medium ${tx.direction === "INCOMING" ? "text-emerald-600" : "text-red-500"}`}>
                      {tx.direction === "INCOMING" ? (
                        <ArrowDownLeft className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      )}
                      {tx.direction === "INCOMING" ? "Entrant" : "Sortant"}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-700">{tx.phone}</TableCell>
                  <TableCell className="text-right font-bold tabular-nums font-mono text-slate-900">
                    {formatAmount(tx.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-bold text-[10px] ${STATUS_BADGES[tx.status]}`}>
                      {tx.status === "SUCCESS" ? "Succès" : tx.status === "PENDING" ? "En attente" : "Échoué"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tx.reconciled ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Rapproché
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(tx.createdAt)}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setDetailTx(tx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
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
      <Dialog open={!!detailTx} onOpenChange={() => setDetailTx(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          {detailTx && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#1864FF]" />
                  Transaction {detailTx.reference}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-5 py-4">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Opérateur</p>
                  <div>
                    <Badge variant="outline" className={`font-bold text-[10px] uppercase tracking-wider ${PROVIDER_COLORS[detailTx.provider]}`}>
                      <Smartphone className="h-3 w-3 mr-1" />
                      {PROVIDER_LABELS[detailTx.provider]}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direction</p>
                  <div className={`flex items-center gap-1.5 text-sm font-bold ${detailTx.direction === "INCOMING" ? "text-emerald-600" : "text-red-500"}`}>
                    {detailTx.direction === "INCOMING" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    {detailTx.direction === "INCOMING" ? "Entrant" : "Sortant"}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Téléphone</p>
                  <p className="font-mono text-sm font-bold text-slate-900">{detailTx.phone}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Montant</p>
                  <p className="text-lg font-bold font-mono text-slate-900">{formatAmount(detailTx.amount)}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frais</p>
                  <p className="font-mono text-sm font-bold text-slate-900">{formatAmount(detailTx.fee)}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</p>
                  <Badge variant="outline" className={`font-bold text-[10px] ${STATUS_BADGES[detailTx.status]}`}>
                    {detailTx.status === "SUCCESS" ? "Succès" : detailTx.status === "PENDING" ? "En attente" : "Échoué"}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</p>
                  <p className="text-sm text-slate-900">{formatDate(detailTx.createdAt)}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Réf. opérateur</p>
                  <p className="font-mono text-sm text-slate-600">{detailTx.operatorReference || "—"}</p>
                </div>
                {detailTx.orderId && (
                  <div className="space-y-3 col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commande liée</p>
                    <p className="font-mono text-sm text-slate-600">{detailTx.orderId}</p>
                  </div>
                )}
                <div className="col-span-2 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Callback reçu</p>
                  <p className={`text-sm font-bold ${detailTx.callbackReceived ? "text-emerald-600" : "text-amber-500"}`}>
                    {detailTx.callbackReceived ? "Oui" : "Non"}
                  </p>
                </div>
                <div className="col-span-2 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rapprochement</p>
                  {detailTx.reconciled ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-bold">Rapproché</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnreconcile(detailTx.id)}
                        className="rounded-xl text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1.5" />
                        Dé-rapprocher
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleReconcile(detailTx.id)}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Marquer comme rapproché
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
