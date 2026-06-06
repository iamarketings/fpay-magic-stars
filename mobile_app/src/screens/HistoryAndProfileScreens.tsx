import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Share,
} from 'react-native';
import { Lock, User, CheckCircle, Shield, UploadCloud } from 'lucide-react-native';
import { useWallet } from '../hooks/useWallet';
import { Tab } from '../types';

const BLUE = '#1864FF';
const SLATE_900 = '#0f172a';
const SLATE_500 = '#64748b';
const SLATE_200 = '#e2e8f0';
const SLATE_50 = '#f8fafc';
const GREEN = '#16a34a';

interface HistoryScreenProps { setTab?: (t: Tab) => void; }
interface ProfileScreenProps { logout: () => void; }

export function HistoryScreen({ setTab }: HistoryScreenProps) {
  const { appState } = useWallet();
  const { transactions } = appState;

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique Complet</Text>
        <Text style={styles.subtitle}>{transactions.length} transaction(s)</Text>
      </View>
      {transactions.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Aucune transaction pour l'instant.</Text>
        </View>
      ) : (
        <View style={styles.txList}>
          {transactions.map(tx => {
            const isIn = tx.type === 'IN' || tx.type === 'BUY';
            const label = tx.type === 'BUY' ? 'Achat FStar' : tx.type === 'IN' ? 'Réception' : tx.type === 'OUT' ? 'Transfert P2P' : 'Récompense';
            return (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txDot, { backgroundColor: isIn ? '#dcfce7' : tx.type === 'REWARD' ? '#eff6ff' : SLATE_50 }]}>
                  <Text style={{ fontSize: 14 }}>{isIn ? '↓' : tx.type === 'REWARD' ? '⭐' : '↑'}</Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txLabel}>{label}</Text>
                  <Text style={styles.txId} numberOfLines={1}>{tx.counterparty || tx.id}</Text>
                  <Text style={styles.txDate}>{new Date(tx.date).toLocaleString()}</Text>
                </View>
                <View style={styles.txAmountCol}>
                  <Text style={[styles.txAmount, isIn ? { color: GREEN } : {}]}>
                    {isIn ? '+' : '-'}{tx.amount}
                  </Text>
                  <Text style={styles.txCurrency}>FStar</Text>
                  <View style={[styles.statusBadge, { backgroundColor: tx.status === 'COMPLETED' ? '#dcfce7' : '#fef9c3' }]}>
                    <Text style={[styles.statusText, { color: tx.status === 'COMPLETED' ? GREEN : '#a16207' }]}>
                      {tx.status === 'COMPLETED' ? '✓' : '…'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

export function ProfileScreen({ logout }: ProfileScreenProps) {
  const { appState, exportBackup } = useWallet();
  const { profile, wallet, kycVerified } = appState;
  const [showKey, setShowKey] = useState(false);

  if (!profile) return null;

  const nameParts = profile.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const OP_NAMES: Record<string, string> = {
    TELMA: 'Telma (Mvola)',
    ORANGE: 'Orange Money',
    AIRTEL: 'Airtel Money',
  };

  const handleRevealKey = () => {
    Alert.prompt(
      '🔐 Saisir le PIN',
      'Entrez votre code PIN à 6 chiffres pour déverrouiller la clé privée.',
      (pin) => {
        if (!pin) return;
        if (pin === wallet?.pin) {
          setShowKey(true);
        } else {
          Alert.alert('PIN incorrect', 'Le code PIN saisi est invalide.');
        }
      },
      'secure-text',
    );
  };

  const handleExportBackup = async () => {
    Alert.prompt(
      '📦 Export de sauvegarde',
      'Entrez votre PIN pour autoriser l\'exportation.',
      async (pin) => {
        if (!pin) return;
        if (pin !== wallet?.pin) {
          Alert.alert('PIN incorrect', 'Code PIN invalide.');
          return;
        }
        const data = await exportBackup();
        if (!data) return;
        await Share.share({
          message: data,
          title: `fpay_backup_${profile.username}.json`,
        });
      },
      'secure-text',
    );
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
      </View>

      {/* Avatar card */}
      <View style={styles.avatarCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{profile.avatar}</Text>
        </View>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileEmail}>{profile.email}</Text>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <User size={14} color={BLUE} />
          <Text style={styles.sectionTitle}>Informations</Text>
        </View>
        <InfoRow label="Prénom" value={firstName} />
        <InfoRow label="Nom" value={lastName} />
        <InfoRow label="Username" value={`@${profile.username}`} mono />
        <InfoRow label="Opérateur" value={OP_NAMES[profile.mmOperator] || profile.mmOperator} />
        <InfoRow label="N° Mobile Money" value={profile.mmNumber} mono />
      </View>

      {/* KYC Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={14} color={BLUE} />
          <Text style={styles.sectionTitle}>KYC</Text>
        </View>
        <View style={styles.kycRow}>
          <CheckCircle size={16} color={GREEN} />
          <View style={styles.kycInfo}>
            <Text style={styles.kycLabel}>Niveau 1 — Email validé</Text>
          </View>
          <Text style={styles.kycBadge}>✓</Text>
        </View>
        <View style={[styles.kycRow, { borderBottomWidth: 0 }]}>
          {kycVerified ? <CheckCircle size={16} color={GREEN} /> : <View style={styles.kycDot} />}
          <View style={styles.kycInfo}>
            <Text style={styles.kycLabel}>Niveau 2 — Identité vérifiée</Text>
          </View>
          <Text style={[styles.kycBadge, !kycVerified && { color: BLUE }]}>{kycVerified ? '✓' : '?'}</Text>
        </View>
      </View>

      {/* Wallet Security */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Lock size={14} color={BLUE} />
          <Text style={styles.sectionTitle}>Sécurité Clé Privée</Text>
        </View>
        {wallet && (
          <View>
            <Text style={styles.label}>Clé Publique</Text>
            <Text style={styles.keyText} numberOfLines={2}>{wallet.publicKey}</Text>
            <Text style={[styles.label, { marginTop: 12 }]}>Clé Privée</Text>
            <Text style={styles.keyText} numberOfLines={2}>
              {showKey ? wallet.secret : '••••••••••••••••••••••••••••••••••••••••'}
            </Text>
            <TouchableOpacity
              style={styles.revealBtn}
              onPress={showKey ? () => setShowKey(false) : handleRevealKey}
            >
              <Text style={styles.revealBtnText}>{showKey ? '🔒 Masquer' : '👁️  Révéler (PIN requis)'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn} onPress={handleExportBackup}>
              <UploadCloud size={14} color={BLUE} />
              <Text style={styles.exportBtnText}>Exporter sauvegarde JSON</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={() => {
        Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Déconnecter', style: 'destructive', onPress: logout },
        ]);
      }}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, mono && styles.monoText]}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SLATE_50 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '900', color: SLATE_900 },
  subtitle: { fontSize: 13, color: SLATE_500, marginTop: 4 },
  avatarCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: '#eff6ff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '900', color: BLUE },
  profileName: { fontSize: 20, fontWeight: '800', color: SLATE_900 },
  profileEmail: { fontSize: 13, color: SLATE_500, marginTop: 4 },
  section: {
    marginHorizontal: 16, marginBottom: 14, backgroundColor: '#fff',
    borderRadius: 16, borderWidth: 1, borderColor: SLATE_200, overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: SLATE_200,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: SLATE_900 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: SLATE_200,
  },
  infoLabel: { fontSize: 12, fontWeight: '700', color: SLATE_500 },
  infoValue: { fontSize: 13, fontWeight: '600', color: SLATE_900, maxWidth: '60%', textAlign: 'right' },
  monoText: { fontFamily: 'Courier', fontSize: 11 },
  kycRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: SLATE_200,
  },
  kycInfo: { flex: 1, marginLeft: 10 },
  kycLabel: { fontSize: 13, fontWeight: '600', color: SLATE_900 },
  kycBadge: { fontSize: 14, fontWeight: '900', color: GREEN },
  kycDot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: BLUE, backgroundColor: '#eff6ff',
  },
  label: { fontSize: 10, fontWeight: '700', color: SLATE_500, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  keyText: {
    fontSize: 10, fontFamily: 'Courier', color: SLATE_500,
    paddingHorizontal: 16, paddingBottom: 8,
  },
  revealBtn: {
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: SLATE_900, borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  revealBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  exportBtn: {
    marginHorizontal: 16, marginTop: 10, marginBottom: 16,
    backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe',
    borderRadius: 10, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  exportBtnText: { color: BLUE, fontWeight: '700', fontSize: 13 },
  logoutBtn: {
    marginHorizontal: 16, marginBottom: 40, marginTop: 8,
    backgroundColor: '#fef2f2', borderWidth: 1.5, borderColor: '#fecaca',
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 14 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 13, color: SLATE_500 },
  txList: {
    marginHorizontal: 16, backgroundColor: '#fff',
    borderRadius: 16, borderWidth: 1, borderColor: SLATE_200, overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: SLATE_200,
  },
  txDot: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txInfo: { flex: 1 },
  txLabel: { fontSize: 13, fontWeight: '700', color: SLATE_900 },
  txId: { fontSize: 10, fontFamily: 'Courier', color: SLATE_500, marginTop: 2 },
  txDate: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  txAmountCol: { alignItems: 'flex-end', gap: 2 },
  txAmount: { fontSize: 14, fontWeight: '800', color: SLATE_900 },
  txCurrency: { fontSize: 10, color: SLATE_500 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: '700' },
});
