import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import {
  PlusCircle, QrCode, Send, Star, ArrowDownLeft, ArrowUpRight, Copy,
} from 'lucide-react-native';
import { useWallet } from '../hooks/useWallet';
import * as Clipboard from 'expo-clipboard';
import { Tab, Transaction } from '../types';

const BLUE = '#1864FF';
const SLATE_900 = '#0f172a';
const SLATE_500 = '#64748b';
const SLATE_200 = '#e2e8f0';
const SLATE_50 = '#f8fafc';

interface HomeScreenProps {
  setTab: (t: Tab) => void;
}

export function HomeScreen({ setTab }: HomeScreenProps) {
  const { appState } = useWallet();
  const { balance, transactions, wallet, profile } = appState;

  const recentTxs = transactions.slice(0, 5);

  const actions = [
    { key: 'buy' as Tab, label: 'Acheter', icon: <PlusCircle size={22} color={SLATE_500} /> },
    { key: 'receive' as Tab, label: 'Recevoir', icon: <QrCode size={22} color={SLATE_500} /> },
    { key: 'send' as Tab, label: 'Envoyer', icon: <Send size={22} color={SLATE_500} /> },
    { key: 'reward' as Tab, label: 'Récompense', icon: <Star size={22} color={SLATE_500} /> },
  ];

  function TxIcon({ tx }: { tx: Transaction }) {
    if (tx.type === 'IN' || tx.type === 'BUY') return <ArrowDownLeft size={18} color="#16a34a" />;
    if (tx.type === 'OUT') return <ArrowUpRight size={18} color="#475569" />;
    return <Star size={18} color={BLUE} />;
  }

  const txBgColor = (type: Transaction['type']) => {
    if (type === 'IN' || type === 'BUY') return '#f0fdf4';
    if (type === 'OUT') return SLATE_50;
    return '#eff6ff';
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Solde Disponible</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Réseau Local</Text>
          </View>
        </View>
        <Text style={styles.balanceAmount}>
          {balance.toLocaleString()} <Text style={styles.balanceCurrency}>FStar</Text>
        </Text>
        {wallet && (
          <TouchableOpacity
            style={styles.pubKeyRow}
            onPress={async () => {
              await Clipboard.setStringAsync(wallet.publicKey);
            }}
          >
            <Text style={styles.pubKeyText} numberOfLines={1}>{wallet.publicKey}</Text>
            <Copy size={12} color={BLUE} />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsGrid}>
        {actions.map(a => (
          <TouchableOpacity key={a.key} style={styles.actionBtn} onPress={() => setTab(a.key)}>
            <View style={styles.actionIcon}>{a.icon}</View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transactions Récentes</Text>
          {transactions.length > 5 && (
            <TouchableOpacity onPress={() => setTab('history')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          )}
        </View>
        {recentTxs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Aucune transaction pour l'instant.</Text>
          </View>
        ) : (
          recentTxs.map(tx => (
            <View key={tx.id} style={styles.txRow}>
              <View style={[styles.txIcon, { backgroundColor: txBgColor(tx.type) }]}>
                <TxIcon tx={tx} />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txType}>
                  {tx.type === 'BUY' ? 'Achat FStar' :
                   tx.type === 'IN' ? 'Réception' :
                   tx.type === 'OUT' ? 'Transfert P2P' : 'Récompense'}
                </Text>
                <Text style={styles.txCounter}>{tx.counterparty || 'Réseau'}</Text>
              </View>
              <View style={styles.txAmountCol}>
                <Text style={[styles.txAmount, (tx.type === 'IN' || tx.type === 'BUY') && { color: '#16a34a' }]}>
                  {tx.type === 'IN' || tx.type === 'BUY' ? '+' : '-'}{tx.amount} FStar
                </Text>
                <Text style={styles.txDate}>{new Date(tx.date).toLocaleDateString()}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SLATE_50 },
  balanceCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  balanceLabel: { fontSize: 11, fontWeight: '700', color: SLATE_500, textTransform: 'uppercase', letterSpacing: 1 },
  badge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#16a34a' },
  balanceAmount: { fontSize: 38, fontWeight: '900', color: SLATE_900, letterSpacing: -1 },
  balanceCurrency: { fontSize: 20, color: SLATE_500, fontWeight: '400' },
  pubKeyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 12, backgroundColor: SLATE_50,
    borderRadius: 8, padding: 8,
  },
  pubKeyText: { flex: 1, fontSize: 10, fontFamily: 'Courier', color: SLATE_500 },
  actionsGrid: {
    flexDirection: 'row', marginHorizontal: 16,
    gap: 10, marginBottom: 20,
  },
  actionBtn: { flex: 1, alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: SLATE_200,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  actionLabel: { fontSize: 10, fontWeight: '700', color: SLATE_500 },
  section: {
    marginHorizontal: 16, marginBottom: 24,
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: SLATE_200,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: SLATE_200,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: SLATE_900 },
  seeAll: { fontSize: 12, fontWeight: '700', color: BLUE },
  emptyBox: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 13, color: SLATE_500 },
  txRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: SLATE_200,
  },
  txIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txInfo: { flex: 1 },
  txType: { fontSize: 13, fontWeight: '700', color: SLATE_900 },
  txCounter: { fontSize: 11, fontFamily: 'Courier', color: SLATE_500, marginTop: 2 },
  txAmountCol: { alignItems: 'flex-end' },
  txAmount: { fontSize: 13, fontWeight: '700', color: SLATE_900 },
  txDate: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
});
