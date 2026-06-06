import { useState } from "react";
import { useBackoffice, type SystemConfig, type SystemStatus } from "@/hooks/use-backoffice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Save, RotateCcw, Settings2, Percent, ArrowLeftRight, Shield } from "lucide-react";

function SettingsCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Card className="glass-panel rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <CardTitle className="text-base flex items-center gap-2 text-slate-900">
          <Icon className="h-4 w-4 text-[#1864FF]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">{children}</CardContent>
    </Card>
  );
}

export default function BackofficeSettings() {
  const { config, updateConfig, resetConfig } = useBackoffice();
  const [local, setLocal] = useState<SystemConfig>({ ...config });

  const handleSave = () => updateConfig(local);
  const handleReset = () => resetConfig();

  return (
    <div className="max-w-2xl space-y-6">
      <SettingsCard title="Taux et Frais" icon={Percent}>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="conversionRate" className="text-sm font-bold text-slate-700">Taux de conversion</Label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
              <span className="text-sm text-slate-500 font-medium">1 FStar =</span>
              <Input id="conversionRate" type="number" value={local.conversionRate} min={1}
                onChange={e => setLocal({ ...local, conversionRate: +e.target.value })}
                className="w-20 border-0 bg-transparent text-right font-bold text-lg h-8 p-0 focus-visible:ring-0" />
              <span className="text-sm text-slate-500 font-medium">Ar</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="merchantFee" className="text-sm font-bold text-slate-700">Frais marchand</Label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
              <Input id="merchantFee" type="number" value={local.merchantFeePercent} min={0} max={100} step={0.1}
                onChange={e => setLocal({ ...local, merchantFeePercent: +e.target.value })}
                className="w-20 border-0 bg-transparent text-right font-bold text-lg h-8 p-0 focus-visible:ring-0" />
              <span className="text-sm text-slate-500 font-medium">%</span>
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Limites" icon={ArrowLeftRight}>
        <div className="space-y-2">
          <Label htmlFor="transferLimit" className="text-sm font-bold text-slate-700">Limite de transfert P2P</Label>
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 max-w-xs">
            <Input id="transferLimit" type="number" value={local.transferLimit} min={0}
              onChange={e => setLocal({ ...local, transferLimit: +e.target.value })}
              className="w-24 border-0 bg-transparent text-right font-bold text-lg h-8 p-0 focus-visible:ring-0" />
            <span className="text-sm text-slate-500 font-medium">FStar</span>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Statut Système" icon={Shield}>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="systemStatus" className="text-sm font-bold text-slate-700">Statut</Label>
              <p className="text-xs text-slate-400">Visibilité pour tous les utilisateurs</p>
            </div>
            <Select value={local.systemStatus} onValueChange={v => setLocal({ ...local, systemStatus: v as SystemStatus })}>
              <SelectTrigger id="systemStatus" className="w-44 bg-slate-50 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPERATIONAL">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Opérationnel
                  </div>
                </SelectItem>
                <SelectItem value="MAINTENANCE">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Maintenance
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <Label htmlFor="kycRequired" className="text-sm font-bold text-slate-700">KYC obligatoire</Label>
              <p className="text-xs text-slate-400">Bloquer les utilisateurs non vérifiés</p>
            </div>
            <Switch id="kycRequired" checked={local.kycRequired}
              onCheckedChange={v => setLocal({ ...local, kycRequired: v })} />
          </div>
        </div>
      </SettingsCard>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} className="rounded-xl h-11 px-6 bg-gradient-to-r from-[#1864FF] to-[#A855F7] hover:from-[#1864FF]/90 hover:to-[#A855F7]/90 text-white shadow-lg shadow-[#1864FF]/20">
          <Save className="h-4 w-4 mr-2" /> Sauvegarder
        </Button>
        <Button variant="outline" onClick={handleReset} className="rounded-xl h-11 px-6 border-slate-200">
          <RotateCcw className="h-4 w-4 mr-2" /> Réinitialiser
        </Button>
      </div>

      {/* About */}
      <Card className="glass-panel rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-slate-900">
            <Settings2 className="h-4 w-4 text-slate-400" />
            À propos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500 space-y-1">
            <p><strong className="text-slate-900">FPay Backoffice</strong> v1.0.0</p>
            <p>Juin 2026 — React 19 + TypeScript + Vite 7 + Tailwind v4 + shadcn/ui</p>
            <p>Source : <span className="text-emerald-600 font-bold">Supabase (live)</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
