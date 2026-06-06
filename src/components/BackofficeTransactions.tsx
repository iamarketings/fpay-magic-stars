import { useState, useMemo } from "react";
import { useBackoffice, type TxType, type TxStatus, type TransactionFilters } from "@/hooks/use-backoffice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { CalendarIcon, ArrowUpDown, ArrowUp, ArrowDown, Search, X } from "lucide-react";

const ITEMS_PER_PAGE = 15;

const TYPE_BADGES: Record<TxType, string> = {
  ACHAT: "bg-blue-50 text-blue-700 border-blue-200",
  TRANSFERT: "bg-purple-50 text-purple-700 border-purple-200",
  RECOMPENSE: "bg-amber-50 text-amber-700 border-amber-200",
  PAIEMENT: "bg-green-50 text-green-700 border-green-200",
};

const STATUS_BADGES: Record<TxStatus, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

const TYPE_LABELS: Record<TxType, string> = { ACHAT: "Achat", TRANSFERT: "Transfert", RECOMPENSE: "Récompense", PAIEMENT: "Paiement" };
const STATUS_LABELS: Record<TxStatus, string> = { COMPLETED: "Complété", PENDING: "En attente", FAILED: "Échoué" };

interface SortState { key: string; direction: "asc" | "desc"; }

function TxTypeBadge({ type }: { type: TxType }) {
  return <Badge variant="outline" className={`font-bold text-[10px] ${TYPE_BADGES[type]}`}>{TYPE_LABELS[type]}</Badge>;
}
function TxStatusBadge({ status }: { status: TxStatus }) {
  const dot = status === "COMPLETED" ? "bg-emerald-500" : status === "PENDING" ? "bg-yellow-500" : "bg-red-500";
  return (
    <Badge variant="outline" className={`font-bold text-[10px] flex items-center gap-1.5 ${STATUS_BADGES[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export default function BackofficeTransactions() {
  const { transactions, getFilteredTransactions } = useBackoffice();
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>({ key: "date", direction: "desc" });

  const filters: TransactionFilters = {
    type: typeFilter as TxType | "ALL",
    status: statusFilter as TxStatus | "ALL",
    dateFrom: dateFrom?.toISOString(),
    dateTo: dateTo?.toISOString(),
    search: search || undefined,
  };

  const filteredBase = useMemo(() => getFilteredTransactions(filters), [getFilteredTransactions, filters]);

  const sorted = useMemo(() => {
    return [...filteredBase].sort((a, b) => {
      const dir = sort.direction === "asc" ? 1 : -1;
      switch (sort.key) {
        case "date": return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
        case "type": return a.type.localeCompare(b.type) * dir;
        case "amount": return (a.amount - b.amount) * dir;
        case "status": return a.status.localeCompare(b.status) * dir;
        case "sender": return a.senderName.localeCompare(b.senderName) * dir;
        case "recipient": return a.recipientName.localeCompare(b.recipientName) * dir;
        default: return 0;
      }
    });
  }, [filteredBase, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useMemo(() => { if (page > totalPages) setPage(1); }, [page, totalPages]);

  const handleSort = (key: string) => setSort(prev => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sort.key !== columnKey) return <ArrowUpDown className="h-3 w-3 ml-1 inline text-slate-300" />;
    return sort.direction === "asc" ? <ArrowUp className="h-3 w-3 ml-1 inline text-[#1864FF]" /> : <ArrowDown className="h-3 w-3 ml-1 inline text-[#1864FF]" />;
  };

  const clearFilters = () => { setTypeFilter("ALL"); setStatusFilter("ALL"); setDateFrom(undefined); setDateTo(undefined); setSearch(""); setPage(1); };
  const hasFilters = typeFilter !== "ALL" || statusFilter !== "ALL" || dateFrom || dateTo || search;

  const FilterChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <Badge variant="secondary" className="gap-1 text-xs px-2 py-1 rounded-lg">
      {label}
      <button onClick={onRemove} className="ml-1 hover:text-red-500"><X className="h-3 w-3" /></button>
    </Badge>
  );

  return (
    <div>
      {/* Filters */}
      <div className="glass-panel rounded-2xl p-4 mb-4">
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <Label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 block">Type</Label>
            <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-32 bg-slate-50 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous</SelectItem>
                <SelectItem value="ACHAT">Achat</SelectItem>
                <SelectItem value="TRANSFERT">Transfert</SelectItem>
                <SelectItem value="RECOMPENSE">Récompense</SelectItem>
                <SelectItem value="PAIEMENT">Paiement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 block">Statut</Label>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-36 bg-slate-50 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous</SelectItem>
                <SelectItem value="COMPLETED">Complété</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="FAILED">Échoué</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 block">Du</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-32 justify-start text-sm font-normal h-9 bg-slate-50">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                  {dateFrom ? formatShortDate(dateFrom.toISOString()) : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateFrom} onSelect={d => { setDateFrom(d); setPage(1); }} /></PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 block">Au</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-32 justify-start text-sm font-normal h-9 bg-slate-50">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                  {dateTo ? formatShortDate(dateTo.toISOString()) : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateTo} onSelect={d => { setDateTo(d); setPage(1); }} /></PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 block">Recherche</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input placeholder="Nom..." className="w-36 pl-8 bg-slate-50 h-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>
      </div>

      {/* Chips */}
      {hasFilters && (
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          {typeFilter !== "ALL" && <FilterChip label={`Type: ${TYPE_LABELS[typeFilter as TxType]}`} onRemove={() => setTypeFilter("ALL")} />}
          {statusFilter !== "ALL" && <FilterChip label={`Statut: ${STATUS_LABELS[statusFilter as TxStatus]}`} onRemove={() => setStatusFilter("ALL")} />}
          {dateFrom && <FilterChip label={`Du: ${formatShortDate(dateFrom.toISOString())}`} onRemove={() => setDateFrom(undefined)} />}
          {dateTo && <FilterChip label={`Au: ${formatShortDate(dateTo.toISOString())}`} onRemove={() => setDateTo(undefined)} />}
          <button onClick={clearFilters} className="text-xs text-[#1864FF] hover:underline ml-1 font-bold">Tout effacer</button>
        </div>
      )}

      <p className="text-xs text-slate-400 mb-3 font-medium">{sorted.length} transaction(s)</p>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              {[
                { key: "date", label: "Date" },
                { key: "type", label: "Type" },
                { key: "sender", label: "Expéditeur" },
                { key: "recipient", label: "Destinataire" },
                { key: "amount", label: "Montant" },
                { key: null, label: "Frais" },
                { key: "status", label: "Statut" },
              ].map(col => (
                <TableHead key={col.label}
                  className={`text-[11px] uppercase tracking-wider text-slate-500 font-bold ${col.key ? "cursor-pointer select-none" : ""} ${col.key === "amount" ? "text-right" : ""}`}
                  onClick={col.key ? () => handleSort(col.key) : undefined}
                >
                  {col.label}
                  {col.key && col.key !== "frais" && <SortIcon columnKey={col.key} />}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-slate-400">Aucune transaction trouvée</TableCell>
              </TableRow>
            ) : (
              paginated.map(tx => (
                <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="text-sm font-mono text-slate-500">{formatShortDate(tx.date)}</TableCell>
                  <TableCell><TxTypeBadge type={tx.type} /></TableCell>
                  <TableCell className="text-sm font-medium text-slate-900">{tx.senderName}</TableCell>
                  <TableCell className="text-sm font-medium text-slate-900">{tx.recipientName}</TableCell>
                  <TableCell className="text-right font-bold tabular-nums text-slate-900 font-mono">
                    {tx.amount.toLocaleString()} <span className="text-[10px] text-slate-400">FStar</span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-400 font-mono">
                    {tx.fee > 0 ? `${tx.fee.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell><TxStatusBadge status={tx.status} /></TableCell>
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2 || p === 1 || p === totalPages).map(p => (
                <PaginationItem key={p}>
                  <PaginationLink href="#" isActive={p === page} onClick={e => { e.preventDefault(); setPage(p); }}>{p}</PaginationLink>
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
    </div>
  );
}
