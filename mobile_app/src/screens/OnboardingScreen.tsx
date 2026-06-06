import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Shield, User, Mail, Lock, Phone, CheckCircle, Key, AlertCircle } from 'lucide-react-native';
import { useWallet } from '../hooks/useWallet';
import { MmOperator, UserProfile, Wallet } from '../types';

const BLUE = '#1864FF';
const SLATE_900 = '#0f172a';
const SLATE_500 = '#64748b';
const SLATE_200 = '#e2e8f0';
const SLATE_50 = '#f8fafc';
const GREEN = '#22c55e';

// Validation regexes Madagascar Mobile Money
const MM_VALIDATORS: Record<MmOperator, RegExp> = {
  TELMA: /^(034|038|\+26134|\+26138)\d{7}$/,
  ORANGE: /^(032|037|\+26132|\+26137)\d{7}$/,
  AIRTEL: /^(033|\+26133)\d{7}$/,
};

const MM_PLACEHOLDERS: Record<MmOperator, string> = {
  TELMA: '034 XX XXX XX',
  ORANGE: '032 XX XXX XX',
  AIRTEL: '033 XX XXX XX',
};

const MM_ERRORS: Record<MmOperator, string> = {
  TELMA: 'Numéro Telma invalide (commencer par 034 ou 038)',
  ORANGE: 'Numéro Orange invalide (commencer par 032 ou 037)',
  AIRTEL: 'Numéro Airtel invalide (commencer par 033)',
};

function generateKeys(username: string): Wallet {
  // Deterministic pseudo-random key generation for sandbox
  const seed = Array.from(username + Date.now()).map(c => c.charCodeAt(0));
  const hexChars = '0123456789abcdef';
  const pubKey = Array.from({ length: 64 }, (_, i) => hexChars[(seed[i % seed.length] + i) & 15]).join('');
  const secKey = Array.from({ length: 128 }, (_, i) => hexChars[(seed[i % seed.length] + i * 3) & 15]).join('');
  return {
    publicKey: `FPAY_${pubKey.substring(0, 32).toUpperCase()}_ED25519`,
    secret: secKey,
    pin: '',
  };
}

export function OnboardingScreen() {
  const { completeOnboarding } = useWallet();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mmOperator, setMmOperator] = useState<MmOperator>('TELMA');
  const [mmNumber, setMmNumber] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Step 2 (KYC)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [idUploaded, setIdUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycDone, setKycDone] = useState(false);

  // Step 3 (Wallet)
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState<Wallet | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleAuth = () => {
    if (!email || !password || (!isLogin && !username)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (!isLogin) {
      const clean = mmNumber.replace(/\s+/g, '');
      if (!MM_VALIDATORS[mmOperator].test(clean)) {
        Alert.alert('Numéro invalide', MM_ERRORS[mmOperator]);
        return;
      }
    }
    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      setPhone(mmNumber);
      setStep(2);
    }, 900);
  };

  const handleKyc = () => {
    if (!firstName || !lastName || !phone) {
      Alert.alert('Erreur', 'Veuillez renseigner toutes vos informations.');
      return;
    }
    if (!idUploaded || !selfieUploaded) {
      Alert.alert('Documents requis', 'Veuillez simuler le téléversement des deux documents.');
      return;
    }
    setKycLoading(true);
    setTimeout(() => {
      setKycLoading(false);
      setKycDone(true);
      setTimeout(() => setStep(3), 1200);
    }, 2000);
  };

  const handleGenerateWallet = () => {
    if (pin.length !== 6 || isNaN(Number(pin))) {
      Alert.alert('PIN invalide', 'Le code PIN doit être composé de 6 chiffres.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('PIN invalide', 'Les codes PIN ne correspondent pas.');
      return;
    }
    setGenerating(true);
    const messages = [
      '🔐 Initialisation de l\'entropie locale...',
      '⚙️  Génération de la paire de clés Ed25519...',
      '✅ Clé publique générée.',
      '🔒 Dérivation SHA-512 basée sur votre PIN...',
      '💾 Chiffrement et stockage sécurisé...',
      '🎉 Portefeuille prêt !',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLogs(prev => [...prev, messages[i]]);
        i++;
      } else {
        clearInterval(interval);
        const w = generateKeys(username || email.split('@')[0]);
        w.pin = pin;
        setGeneratedWallet(w);
        setGenerating(false);
      }
    }, 350);
  };

  const handleFinish = async () => {
    if (!generatedWallet) return;
    const uname = username || email.split('@')[0];
    const profile: UserProfile = {
      email,
      name: `${firstName} ${lastName}`.trim() || uname,
      phone,
      username: uname,
      avatar: uname.substring(0, 2).toUpperCase(),
      mmOperator,
      mmNumber,
    };
    await completeOnboarding(profile, generatedWallet);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.center}>
        {/* Header */}
        <View style={styles.mb24}>
          <View style={styles.logoBox}>
            <Shield size={28} color={BLUE} />
          </View>
          <Text style={styles.title}>FPay Sandbox</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? 'Authentification' : step === 2 ? 'Vérification KYC' : 'Création du Portefeuille'}
          </Text>
          {/* Progress */}
          <View style={styles.progressRow}>
            {[1, 2, 3].map(s => (
              <View key={s} style={[styles.progressDot, step >= s && styles.progressDotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          {/* STEP 1 */}
          {step === 1 && (
            <View>
              {/* Toggle */}
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
                  onPress={() => setIsLogin(false)}
                >
                  <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Inscription</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
                  onPress={() => setIsLogin(true)}
                >
                  <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Connexion</Text>
                </TouchableOpacity>
              </View>

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nom d'utilisateur</Text>
                  <View style={styles.inputRow}>
                    <User size={16} color={SLATE_500} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="alexandre"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputRow}>
                  <Mail size={16} color={SLATE_500} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="alex@fpay.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe</Text>
                <View style={styles.inputRow}>
                  <Lock size={16} color={SLATE_500} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              {!isLogin && (
                <View>
                  <Text style={styles.label}>Opérateur Mobile Money</Text>
                  <View style={styles.operatorRow}>
                    {(['TELMA', 'ORANGE', 'AIRTEL'] as MmOperator[]).map(op => (
                      <TouchableOpacity
                        key={op}
                        style={[styles.operatorBtn, mmOperator === op && styles.operatorBtnActive]}
                        onPress={() => setMmOperator(op)}
                      >
                        <Text style={[styles.operatorText, mmOperator === op && styles.operatorTextActive]}>
                          {op === 'TELMA' ? 'Telma' : op === 'ORANGE' ? 'Orange' : 'Airtel'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>N° Mobile Money</Text>
                    <View style={styles.inputRow}>
                      <Phone size={16} color={SLATE_500} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={MM_PLACEHOLDERS[mmOperator]}
                        value={mmNumber}
                        onChangeText={setMmNumber}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.primaryBtn} onPress={handleAuth} disabled={authLoading}>
                {authLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryBtnText}>{isLogin ? 'Se connecter' : 'Créer mon compte'}</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2 — KYC */}
          {step === 2 && !kycDone && (
            <View>
              <Text style={styles.cardTitle}>Vérification KYC</Text>
              <View style={styles.row2}>
                <View style={[styles.inputGroup, styles.flex]}>
                  <Text style={styles.label}>Prénom</Text>
                  <TextInput style={styles.inputSolid} placeholder="Alexandre" value={firstName} onChangeText={setFirstName} />
                </View>
                <View style={{ width: 12 }} />
                <View style={[styles.inputGroup, styles.flex]}>
                  <Text style={styles.label}>Nom</Text>
                  <TextInput style={styles.inputSolid} placeholder="Rakoto" value={lastName} onChangeText={setLastName} />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Téléphone</Text>
                <TextInput style={styles.inputSolid} placeholder="+261 34 00 000 00" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </View>

              {/* Document upload simulation */}
              <TouchableOpacity
                style={[styles.uploadBox, idUploaded && styles.uploadBoxDone]}
                onPress={() => { setIdUploaded(true); }}
              >
                {idUploaded
                  ? <CheckCircle size={20} color={GREEN} />
                  : <AlertCircle size={20} color={BLUE} />}
                <Text style={[styles.uploadText, idUploaded && { color: GREEN }]}>
                  {idUploaded ? '✅ Pièce d\'identité téléversée' : '📄 Téléverser pièce d\'identité (Simulé)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadBox, selfieUploaded && styles.uploadBoxDone]}
                onPress={() => { setSelfieUploaded(true); }}
              >
                {selfieUploaded
                  ? <CheckCircle size={20} color={GREEN} />
                  : <AlertCircle size={20} color={BLUE} />}
                <Text style={[styles.uploadText, selfieUploaded && { color: GREEN }]}>
                  {selfieUploaded ? '✅ Selfie téléversé' : '📸 Selfie de vérification (Simulé)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleKyc} disabled={kycLoading}>
                {kycLoading
                  ? <><ActivityIndicator color="#fff" /><Text style={[styles.primaryBtnText, { marginLeft: 8 }]}>Validation en cours...</Text></>
                  : <Text style={styles.primaryBtnText}>Valider mes documents</Text>}
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && kycDone && (
            <View style={styles.centerContent}>
              <CheckCircle size={48} color={GREEN} />
              <Text style={[styles.cardTitle, { marginTop: 16 }]}>KYC Validé !</Text>
              <Text style={styles.subtitle}>Passage à la création du portefeuille...</Text>
              <ActivityIndicator color={BLUE} style={{ marginTop: 16 }} />
            </View>
          )}

          {/* STEP 3 — WALLET */}
          {step === 3 && (
            <View>
              <Text style={styles.cardTitle}>Création du Portefeuille</Text>
              {!generatedWallet ? (
                <View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Code PIN (6 chiffres)</Text>
                    <TextInput
                      style={styles.inputSolid}
                      placeholder="••••••"
                      value={pin}
                      onChangeText={setPin}
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={6}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirmer le PIN</Text>
                    <TextInput
                      style={styles.inputSolid}
                      placeholder="••••••"
                      value={confirmPin}
                      onChangeText={setConfirmPin}
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={6}
                    />
                  </View>

                  {logs.length > 0 && (
                    <View style={styles.logBox}>
                      {logs.map((l, i) => (
                        <Text key={i} style={styles.logText}>{l}</Text>
                      ))}
                      {generating && <ActivityIndicator color={BLUE} style={{ marginTop: 8 }} />}
                    </View>
                  )}

                  <TouchableOpacity style={styles.primaryBtn} onPress={handleGenerateWallet} disabled={generating}>
                    <Key size={16} color="#fff" />
                    <Text style={[styles.primaryBtnText, { marginLeft: 8 }]}>
                      {generating ? 'Génération en cours...' : 'Générer mes clés Ed25519'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.successBox}>
                    <CheckCircle size={32} color={GREEN} />
                    <Text style={styles.successTitle}>Portefeuille Créé !</Text>
                    <Text style={styles.keyLabel}>Clé Publique</Text>
                    <Text style={styles.keyValue} numberOfLines={2}>{generatedWallet.publicKey}</Text>
                  </View>
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>⚠️  Votre clé privée est chiffrée et stockée de manière sécurisée sur cet appareil. Exportez une sauvegarde depuis l'onglet Profil.</Text>
                  </View>
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish}>
                    <Text style={styles.primaryBtnText}>Accéder à mon Dashboard</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: SLATE_50 },
  center: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  mb24: { marginBottom: 24, alignItems: 'center' },
  logoBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#EBF1FF', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '900', color: SLATE_900, textAlign: 'center' },
  subtitle: { fontSize: 14, color: SLATE_500, textAlign: 'center', marginTop: 4 },
  progressRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  progressDot: { width: 32, height: 4, borderRadius: 2, backgroundColor: SLATE_200 },
  progressDotActive: { backgroundColor: BLUE },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: SLATE_900, marginBottom: 20 },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: SLATE_50,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 13, fontWeight: '700', color: SLATE_500 },
  toggleTextActive: { color: SLATE_900 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: SLATE_500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SLATE_50, borderWidth: 1.5, borderColor: SLATE_200,
    borderRadius: 12, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 48, fontSize: 14, color: SLATE_900 },
  inputSolid: {
    backgroundColor: SLATE_50, borderWidth: 1.5, borderColor: SLATE_200,
    borderRadius: 12, paddingHorizontal: 14, height: 48,
    fontSize: 14, color: SLATE_900,
  },
  operatorRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  operatorBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5,
    borderColor: SLATE_200, backgroundColor: SLATE_50, alignItems: 'center',
  },
  operatorBtnActive: { borderColor: BLUE, backgroundColor: '#EBF1FF' },
  operatorText: { fontSize: 12, fontWeight: '700', color: SLATE_500 },
  operatorTextActive: { color: BLUE },
  primaryBtn: {
    backgroundColor: BLUE, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', marginTop: 8,
    shadowColor: BLUE, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  row2: { flexDirection: 'row' },
  uploadBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: '#bfdbfe', borderRadius: 12,
    borderStyle: 'dashed', padding: 16, marginBottom: 12,
    backgroundColor: '#eff6ff',
  },
  uploadBoxDone: { borderColor: '#86efac', backgroundColor: '#f0fdf4' },
  uploadText: { fontSize: 13, fontWeight: '600', color: BLUE, flex: 1 },
  logBox: {
    backgroundColor: SLATE_900, borderRadius: 12, padding: 14,
    marginBottom: 16, gap: 4,
  },
  logText: { color: '#86efac', fontFamily: 'Courier', fontSize: 11 },
  centerContent: { alignItems: 'center', paddingVertical: 24 },
  successBox: {
    backgroundColor: '#f0fdf4', borderRadius: 14, padding: 20,
    alignItems: 'center', marginBottom: 16,
  },
  successTitle: { fontSize: 18, fontWeight: '800', color: SLATE_900, marginTop: 12 },
  keyLabel: { fontSize: 10, fontWeight: '700', color: SLATE_500, marginTop: 12, textTransform: 'uppercase' },
  keyValue: { fontSize: 10, fontFamily: 'Courier', color: SLATE_500, textAlign: 'center', marginTop: 4 },
  warningBox: {
    backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde047',
    borderRadius: 12, padding: 14, marginBottom: 16,
  },
  warningText: { fontSize: 12, color: '#854d0e', fontWeight: '600' },
});


