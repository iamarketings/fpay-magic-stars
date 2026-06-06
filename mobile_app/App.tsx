import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { useState } from 'react';
import { WalletProvider, useWallet } from './src/hooks/useWallet';
import { Tab } from './src/types';

// Screens
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { BuyScreen } from './src/screens/BuyScreen';
import { ReceiveScreen, SendScreen, RewardScreen } from './src/screens/ActionScreens';
import { HistoryScreen, ProfileScreen } from './src/screens/HistoryAndProfileScreens';
import { BottomNav } from './src/components/BottomNav';

function AppContent() {
  const { appState, isLoading, logout } = useWallet();
  const [tab, setTab] = useState<Tab>('home');

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingLogo}>FPay</Text>
        <ActivityIndicator color="#1864FF" size="large" style={{ marginTop: 24 }} />
        <Text style={styles.loadingText}>Chargement de votre session...</Text>
      </View>
    );
  }

  if (!appState.isLoggedIn) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <OnboardingScreen />
      </SafeAreaView>
    );
  }

  const renderScreen = () => {
    switch (tab) {
      case 'home':    return <HomeScreen setTab={setTab} />;
      case 'buy':     return <BuyScreen setTab={setTab} />;
      case 'receive': return <ReceiveScreen setTab={setTab} />;
      case 'send':    return <SendScreen setTab={setTab} />;
      case 'reward':  return <RewardScreen setTab={setTab} />;
      case 'history': return <HistoryScreen setTab={setTab} />;
      case 'profile': return <ProfileScreen logout={logout} />;
      default:        return <HomeScreen setTab={setTab} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomNav tab={tab} setTab={setTab} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flex: 1 },
  loadingScreen: {
    flex: 1, backgroundColor: '#f8fafc',
    alignItems: 'center', justifyContent: 'center',
  },
  loadingLogo: {
    fontSize: 42, fontWeight: '900', color: '#1864FF', letterSpacing: -2,
  },
  loadingText: {
    fontSize: 14, color: '#64748b', marginTop: 12,
  },
});
