import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useWallet } from '../hooks/useWallet';
import { Tab, MmOperator, Transaction } from '../types';

const BLUE = '#1864FF';
const SLATE_900 = '#0f172a';
const SLATE_500 = '#64748b';
const SLATE_200 = '#e2e8f0';
const SLATE_50 = '#f8fafc';

const USSD: Record<MmOperator, string> = {
  TELMA: 'Composer le #111# (MVola) pour valider la transaction.',
  ORANGE: 'Composer le #144# (Orange Money) pour valider la transaction.',
  AIRTEL: 'Composer le #400# (Airtel Money) pour valider la transaction.',
};

const OP_NAMES: Record<MmOperator, string> = {
  TELMA: 'Telma (Mvola)',
  ORANGE: 'Orange Money',
  AIRTEL: 'Airtel Money',
};

interface BuyScreenProps {
  setTab: (t: Tab) => void;
}

export function BuyScreen({ setTab }: BuyScreenProps) {
  const { appState, addTransaction, updateBalance } = useWallet();
  const { balance, profile, wallet } = appState;
  const [purchaseStep, setPurchaseStep] = useState<'AMOUNT' | 'PAYMENT'>('AMOUNT');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'MM' | null>(null);
  const [mmPhone, setMmPhone] = useState(profile?.mmNumber || '');
  const [loading, setLoading] = useState(false);

  const mmOp = profile?.mmOperator || 'TELMA';

  const handlePay = () => {
    if (!paymentMethod) {
      Alert.alert('Méthode requise', 'Choisissez une méthode de paiement.');
      return;
    }
    const fstars = parseFloat(amount);
    if (!fstars || fstars <= 0) return;

    setLoading(true);
    setTimeout(async () => {
      const newBalance = balance + fstars;
      await updateBalance(newBalance);
      const tx: Transaction = {
        id: 'TX_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        type: 'BUY',
        amount: fstars,
        date: new Date().toISOString(),
        counterparty: paymentMethod === 'MM' ? `${OP_NAMES[mmOp]} - ${mmPhone}` : 'Carte Bancaire',
        status: 'COMPLETED',
      };
      await addTransaction(tx);
      setLoading(false);
      Alert.alert('✅ Achat réussi !', `${fstars} FStar ont été crédités sur votre wallet.`);
      setPurchaseStep('AMOUNT');
      setAmount('');
      setPaymentMethod(null);
      setTab('home');
    }, 1800);
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => setTab('home')}>
          <Text style={styles.backBtn}>← Retour</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Acheter des FStar</Text>

        {purchaseStep === 'AMOUNT' ? (
          <View>
            <Text style={styles.label}>Montant (FStar)</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="1000"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <View style={styles.presets}>
              {['100', '500', '1000', '5000'].map(v => (
                <TouchableOpacity key={v} style={styles.presetBtn} onPress={() => setAmount(v)}>
                  <Text style={styles.presetText}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => { if (amount && parseFloat(amount) > 0) setPurchaseStep('PAYMENT'); else Alert.alert('Montant requis', 'Entrez un montant valide.'); }}
            >
              <Text style={styles.primaryBtnText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Montant à acheter</Text>
              <Text style={styles.summaryAmount}>{amount} FStar</Text>
            </View>

            <Text style={styles.label}>Méthode de paiement</Text>
            <View style={styles.methodRow}>
              <TouchableOpacity
                style={[styles.methodBtn, paymentMethod === 'STRIPE' && styles.methodBtnActive]}
                onPress={() => setPaymentMethod('STRIPE')}
              >
                <Text style={[styles.methodText, paymentMethod === 'STRIPE' && styles.methodTextActive]}>💳 Carte Bancaire</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.methodBtn, paymentMethod === 'MM' && styles.methodBtnActive]}
                onPress={() => setPaymentMethod('MM')}
              >
                <Text style={[styles.methodText, paymentMethod === 'MM' && styles.methodTextActive]}>📱 Mobile Money</Text>
              </TouchableOpacity>
            </View>

            {paymentMethod === 'MM' && (
              <View style={styles.mmBox}>
                <Text style={styles.label}>N° Téléphone</Text>
                <TextInput
                  style={styles.inputSolid}
                  value={mmPhone}
                  onChangeText={setMmPhone}
                  keyboardType="phone-pad"
                  placeholder={profile?.mmNumber || '034 XX XXX XX'}
                />
                <View style={styles.ussdBox}>
                  <Text style={styles.ussdTitle}>Opérateur détecté : {OP_NAMES[mmOp]}</Text>
                  <Text style={styles.ussdText}>{USSD[mmOp]}</Text>
                </View>
              </View>
            )}

            {paymentMethod === 'STRIPE' && (
              <View style={styles.mmBox}>
                <Text style={styles.stripeNote}>🔒 Paiement simulé par carte. Aucune donnée bancaire réelle n'est utilisée dans ce sandbox.</Text>
              </View>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtnSecondary} onPress={() => setPurchaseStep('AMOUNT')}>
                <Text style={styles.backBtnText}>Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.payBtn, (!paymentMethod || loading) && styles.payBtnDisabled]}
                onPress={handlePay}
                disabled={!paymentMethod || loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Payer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  amountInput: {
    backgroundColor: SLATE_50, borderWidth: 2, borderColor: SLATE_200,
    borderRadius: 14, paddingHorizontal: 16, height: 60,
    fontSize: 28, fontWeight: '900', color: SLATE_900, marginBottom: 12,
  },
  presets: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  presetBtn: {
    flex: 1, paddingVertical: 8, backgroundColor: SLATE_50,
    borderWidth: 1.5, borderColor: SLATE_200, borderRadius: 10, alignItems: 'center',
  },
  presetText: { fontSize: 12, fontWeight: '700', color: SLATE_900 },
  primaryBtn: {
    backgroundColor: BLUE, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', shadowColor: BLUE, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  summaryBox: {
    backgroundColor: '#eff6ff', borderRadius: 12, padding: 16,
    marginBottom: 20, alignItems: 'center',
  },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: BLUE, textTransform: 'uppercase' },
  summaryAmount: { fontSize: 32, fontWeight: '900', color: SLATE_900, marginTop: 4 },
  methodRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  methodBtn: {
    flex: 1, paddingVertical: 14, borderWidth: 1.5,
    borderColor: SLATE_200, borderRadius: 12, alignItems: 'center',
    backgroundColor: SLATE_50,
  },
  methodBtnActive: { borderColor: BLUE, backgroundColor: '#eff6ff' },
  methodText: { fontSize: 12, fontWeight: '700', color: SLATE_500 },
  methodTextActive: { color: BLUE },
  mmBox: { marginBottom: 16 },
  inputSolid: {
    backgroundColor: SLATE_50, borderWidth: 1.5, borderColor: SLATE_200,
    borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 14, color: SLATE_900,
    marginBottom: 12,
  },
  ussdBox: {
    backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe',
    borderRadius: 12, padding: 14,
  },
  ussdTitle: { fontSize: 12, fontWeight: '700', color: BLUE, marginBottom: 4 },
  ussdText: { fontSize: 11, color: SLATE_500 },
  stripeNote: { fontSize: 12, color: SLATE_500, lineHeight: 18, padding: 12, backgroundColor: SLATE_50, borderRadius: 10 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  backBtnSecondary: {
    flex: 1, paddingVertical: 14, borderWidth: 1.5, borderColor: SLATE_200,
    borderRadius: 12, alignItems: 'center',
  },
  backBtnText: { fontSize: 14, fontWeight: '700', color: SLATE_500 },
  payBtn: {
    flex: 2, paddingVertical: 14, backgroundColor: SLATE_900,
    borderRadius: 12, alignItems: 'center',
  },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
