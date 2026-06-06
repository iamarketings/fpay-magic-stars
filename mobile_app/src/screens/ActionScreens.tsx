import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { QrCode, Copy } from 'lucide-react-native';
import { useWallet } from '../hooks/useWallet';
import * as Clipboard from 'expo-clipboard';
import { Tab, Transaction } from '../types';

const BLUE = '#1864FF';
const SLATE_900 = '#0f172a';
const SLATE_500 = '#64748b';
const SLATE_200 = '#e2e8f0';
const SLATE_50 = '#f8fafc';

interface SendScreenProps { setTab: (t: Tab) => void; }
interface ReceiveScreenProps { setTab: (t: Tab) => void; }
interface RewardScreenProps { setTab: (t: Tab) => void; }

export function ReceiveScreen({ setTab }: ReceiveScreenProps) {
  const { appState } = useWallet();
  const { wallet } = appState;

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => setTab('home')}>
          <Text style={styles.backBtn}>← Retour</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Recevoir des FStar</Text>
        {!wallet ? (
          <Text style={styles.warningText}>Wallet non initialisé.</Text>
        ) : (
          <View style={styles.centerContent}>
            {/* QR Code Simulé */}
            <View style={styles.qrBox}>
              <QrCode size={160} color={SLATE_900} strokeWidth={1} />
            </View>
            <Text style={styles.qrHint}>Présentez ce QR code pour recevoir des FStar</Text>

            <View style={styles.keyBox}>
              <Text style={styles.keyLabel}>Clé Publique</Text>
              <Text style={styles.keyValue} numberOfLines={2}>{wallet.publicKey}</Text>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={async () => {
                  await Clipboard.setStringAsync(wallet.publicKey);
                  Alert.alert('✅ Copié !', 'Clé publique copiée dans le presse-papiers.');
                }}
              >
                <Copy size={14} color={BLUE} />
                <Text style={styles.copyText}>Copier la clé</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export function SendScreen({ setTab }: SendScreenProps) {
  const { appState, addTransaction, updateBalance } = useWallet();
  const { balance, wallet } = appState;
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<'FPAY' | 'MADASTARS'>('FPAY');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    const fstars = parseFloat(amount);
    if (!recipient || !fstars) {
      Alert.alert('Champs requis', 'Remplissez la clé destinataire et le montant.');
      return;
    }
    if (!recipient.startsWith('FPAY_')) {
      Alert.alert('Clé invalide', 'La clé publique doit commencer par FPAY_');
      return;
    }
    if (fstars > balance) {
      Alert.alert('Solde insuffisant', `Votre solde est de ${balance} FStar.`);
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      const newBalance = balance - fstars;
      await updateBalance(newBalance);
      const tx: Transaction = {
        id: 'TX_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        type: 'OUT',
        amount: fstars,
        date: new Date().toISOString(),
        counterparty: `${recipient.substring(0, 12)}...`,
        status: 'COMPLETED',
      };
      await addTransaction(tx);
      setLoading(false);
      Alert.alert('✅ Envoi réussi !', `${fstars} FStar envoyés via ${network}.`);
      setRecipient('');
      setAmount('');
      setTab('home');
    }, 1500);
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => setTab('home')}><Text style={styles.backBtn}>← Retour</Text></TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Envoyer des FStar</Text>

        <Text style={styles.label}>Réseau</Text>
        <View style={styles.networkRow}>
          {(['FPAY', 'MADASTARS'] as const).map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.networkBtn, network === n && styles.networkBtnActive]}
              onPress={() => setNetwork(n)}
            >
              <Text style={[styles.networkText, network === n && styles.networkTextActive]}>
                {n === 'FPAY' ? 'Réseau FPay' : 'MadaStars'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Clé publique destinataire</Text>
        <TextInput
          style={styles.inputSolid}
          placeholder="FPAY_..."
          value={recipient}
          onChangeText={setRecipient}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Montant (FStar)</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <Text style={styles.balanceHint}>Solde disponible : {balance.toLocaleString()} FStar</Text>

        <TouchableOpacity
          style={[styles.primaryBtn, (!wallet || loading) && { opacity: 0.5 }]}
          onPress={handleSend}
          disabled={!wallet || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Signer et Envoyer</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export function RewardScreen({ setTab }: RewardScreenProps) {
  const { appState, addTransaction, updateBalance } = useWallet();
  const { balance, wallet } = appState;
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [service, setService] = useState('');
  const [loading, setLoading] = useState(false);

  const services = ['Modération Communautaire', 'Entraide / Tutorat', 'Création Artistique', 'Développement Outils'];

  const handleReward = () => {
    const fstars = parseFloat(amount);
    if (!recipient || !fstars || !service) {
      Alert.alert('Champs requis', 'Remplissez tous les champs.');
      return;
    }
    if (fstars > balance) {
      Alert.alert('Solde insuffisant', `Votre solde est de ${balance} FStar.`);
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      const newBalance = balance - fstars;
      await updateBalance(newBalance);
      const tx: Transaction = {
        id: 'TX_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        type: 'REWARD',
        amount: fstars,
        date: new Date().toISOString(),
        counterparty: `${recipient.substring(0, 12)}... (${service})`,
        status: 'COMPLETED',
      };
      await addTransaction(tx);
      setLoading(false);
      Alert.alert('✅ Récompense envoyée !', `${fstars} FStar attribués pour : ${service}`);
      setRecipient('');
      setAmount('');
      setService('');
      setTab('home');
    }, 1500);
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => setTab('home')}><Text style={styles.backBtn}>← Retour</Text></TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Récompenser un Membre</Text>

        <Text style={styles.label}>Clé publique du membre</Text>
        <TextInput
          style={styles.inputSolid}
          placeholder="FPAY_..."
          value={recipient}
          onChangeText={setRecipient}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Service rendu</Text>
        <View style={styles.serviceList}>
          {services.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.serviceBtn, service === s && styles.serviceBtnActive]}
              onPress={() => setService(s)}
            >
              <Text style={[styles.serviceText, service === s && styles.serviceTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Montant (FStar)</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.darkBtn, (!wallet || loading) && { opacity: 0.5 }]}
          onPress={handleReward}
          disabled={!wallet || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Récompenser</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SLATE_50 },
  backRow: { paddingHorizontal: 20, paddingTop: 16 },
  backBtn: { fontSize: 14, fontWeight: '700', color: SLATE_500 },
  card: {
    margin: 16, backgroundColor: '#fff', borderRadius: 20,
    padding: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  title: { fontSize: 22, fontWeight: '900', color: SLATE_900, marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '700', color: SLATE_500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputSolid: {
    backgroundColor: SLATE_50, borderWidth: 1.5, borderColor: SLATE_200,
    borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 14, color: SLATE_900, marginBottom: 14,
  },
  amountInput: {
    backgroundColor: SLATE_50, borderWidth: 2, borderColor: SLATE_200,
    borderRadius: 14, paddingHorizontal: 16, height: 60,
    fontSize: 28, fontWeight: '900', color: SLATE_900, marginBottom: 8,
  },
  balanceHint: { fontSize: 11, color: SLATE_500, marginBottom: 16 },
  networkRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  networkBtn: {
    flex: 1, paddingVertical: 12, borderWidth: 1.5,
    borderColor: SLATE_200, borderRadius: 12, alignItems: 'center',
    backgroundColor: SLATE_50,
  },
  networkBtnActive: { borderColor: BLUE, backgroundColor: '#eff6ff' },
  networkText: { fontSize: 12, fontWeight: '700', color: SLATE_500 },
  networkTextActive: { color: BLUE },
  primaryBtn: {
    backgroundColor: BLUE, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: BLUE, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  darkBtn: {
    backgroundColor: SLATE_900, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  centerContent: { alignItems: 'center' },
  qrBox: {
    width: 200, height: 200, backgroundColor: '#fff',
    borderRadius: 16, borderWidth: 2, borderColor: SLATE_200,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  qrHint: { fontSize: 12, color: SLATE_500, textAlign: 'center', marginBottom: 24 },
  keyBox: {
    width: '100%', backgroundColor: SLATE_50, borderWidth: 1.5,
    borderColor: SLATE_200, borderRadius: 14, padding: 14,
  },
  keyLabel: { fontSize: 10, fontWeight: '700', color: SLATE_500, textTransform: 'uppercase', marginBottom: 6 },
  keyValue: { fontSize: 11, fontFamily: 'Courier', color: SLATE_900, marginBottom: 12 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#eff6ff', borderRadius: 8, padding: 10, alignSelf: 'flex-start',
  },
  copyText: { fontSize: 12, fontWeight: '700', color: BLUE },
  warningText: { fontSize: 14, color: '#d97706' },
  serviceList: { gap: 8, marginBottom: 16 },
  serviceBtn: {
    paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: SLATE_200, borderRadius: 12,
    backgroundColor: SLATE_50,
  },
  serviceBtnActive: { borderColor: BLUE, backgroundColor: '#eff6ff' },
  serviceText: { fontSize: 13, fontWeight: '600', color: SLATE_500 },
  serviceTextActive: { color: BLUE },
});
