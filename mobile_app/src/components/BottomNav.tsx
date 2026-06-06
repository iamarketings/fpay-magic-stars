import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Wallet, History, User, ShoppingBag, QrCode, Send, Star } from 'lucide-react-native';
import { Tab } from '../types';

const BLUE = '#1864FF';
const SLATE_400 = '#94a3b8';

interface BottomNavProps {
  tab: Tab;
  setTab: (t: Tab) => void;
}

const NAV_ITEMS = [
  { key: 'home' as Tab, label: 'Wallet', icon: Wallet },
  { key: 'history' as Tab, label: 'Historique', icon: History },
  { key: 'profile' as Tab, label: 'Profil', icon: User },
];

export function BottomNav({ tab, setTab }: BottomNavProps) {
  return (
    <View style={styles.nav}>
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
        const active = tab === key;
        return (
          <TouchableOpacity
            key={key}
            style={styles.navItem}
            onPress={() => setTab(key)}
            activeOpacity={0.7}
          >
            <Icon size={22} color={active ? BLUE : SLATE_400} strokeWidth={active ? 2.5 : 2} />
            {active && <Text style={styles.navLabel}>{label}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: BLUE,
    letterSpacing: 0.3,
  },
});
