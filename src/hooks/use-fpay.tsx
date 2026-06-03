import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import nacl from "tweetnacl";
import util from "tweetnacl-util";

export type ProfileId = "USER" | "CREATOR" | "MEMBER";

export interface Profile {
  id: ProfileId;
  name: string;
  role: string;
  avatar: string;
  email: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: "ACHAT" | "TRANSFERT" | "RECOMPENSE" | "SORTIE";
  description: string;
  amount: number;
  senderName?: string;
  recipientName?: string;
  status: "COMPLETED" | "PENDING";
}

interface Wallet {
  publicKey: string;
  privateKey?: string;
}

interface FPayContextType {
  activeProfile: Profile;
  profiles: Record<ProfileId, Profile>;
  balance: number;
  balances: Record<ProfileId, number>;
  transactions: Transaction[];
  wallet: Wallet | null;
  changeProfile: (id: ProfileId) => void;
  generateWallet: () => void;
  buyFstart: (fstar: number, method: "STRIPE" | "MOBILE_MONEY") => void;
  transferP2P: (recipientId: ProfileId, fstar: number) => boolean;
  rewardMember: (recipientId: ProfileId, fstar: number, serviceName: string) => boolean;
  externalTransfer: (fstar: number) => boolean;
}

const FPayContext = createContext<FPayContextType | undefined>(undefined);

const PROFILES: Record<ProfileId, Profile> = {
  USER: {
    id: "USER",
    name: "Jean-Luc",
    role: "Membre Communauté",
    avatar: "JL",
    email: "jeanluc@fpay.mg",
  },
  CREATOR: {
    id: "CREATOR",
    name: "Clara Stream",
    role: "Créatrice de contenu",
    avatar: "CS",
    email: "clara.stream@fpay.mg",
  },
  MEMBER: {
    id: "MEMBER",
    name: "Olivia Art",
    role: "Illustratrice 2D",
    avatar: "OA",
    email: "olivia.art@fpay.mg",
  },
};

const INITIAL_BALANCES: Record<ProfileId, number> = {
  USER: 1500,
  CREATOR: 24000,
  MEMBER: 8500,
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_1",
    date: "01/06/2026 14:32",
    type: "ACHAT",
    description: "Achat Pack 500 FStar (Stripe)",
    amount: 500,
    status: "COMPLETED",
  },
];

export const FPayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProfileId, setActiveProfileId] = useState<ProfileId>("USER");
  const [balances, setBalances] = useState(INITIAL_BALANCES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const activeProfile = PROFILES[activeProfileId];
  const balance = balances[activeProfileId];

  // Chargement du wallet depuis le localStorage (Proxy Visuel)
  useEffect(() => {
    const savedKey = localStorage.getItem(`fpay_wallet_${activeProfileId}`);
    if (savedKey) {
      try {
        const secretKey = util.decodeBase64(savedKey);
        const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey);
        setWallet({
          publicKey: util.encodeBase64(keyPair.publicKey),
          privateKey: savedKey
        });
      } catch (e) {
        console.error("Erreur lecture wallet", e);
      }
    } else {
      setWallet(null);
    }
  }, [activeProfileId]);

  const changeProfile = (id: ProfileId) => {
    setActiveProfileId(id);
    toast.info(`Profil changé : ${PROFILES[id].name}`);
  };

  // Génération de clé Ed25519 100% locale (Non-Custodial)
  const generateWallet = () => {
    const keyPair = nacl.sign.keyPair();
    const privKeyStr = util.encodeBase64(keyPair.secretKey);
    const pubKeyStr = util.encodeBase64(keyPair.publicKey);
    localStorage.setItem(`fpay_wallet_${activeProfileId}`, privKeyStr);
    setWallet({ publicKey: pubKeyStr, privateKey: privKeyStr });
    toast.success("Nouveau portefeuille Ed25519 généré localement !");
  };

  const getFormattedDate = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  // 1. ACHAT (Cash-In)
  const buyFstart = (fstar: number, method: "STRIPE" | "MOBILE_MONEY") => {
    setBalances((prev) => ({
      ...prev,
      [activeProfileId]: prev[activeProfileId] + fstar,
    }));

    const newTx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      date: getFormattedDate(),
      type: "ACHAT",
      description: `Acquisition ${fstar} FStar via ${method}`,
      amount: fstar,
      status: "COMPLETED",
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.success(`Succès ! ${fstar} FStar ajoutés via ${method}.`);
  };

  // Helper interne pour signer localement (Ed25519)
  const signPayload = (payload: string) => {
    if (!wallet || !wallet.privateKey) throw new Error("Wallet introuvable");
    const secretKey = util.decodeBase64(wallet.privateKey);
    const msg = util.decodeUTF8(payload);
    const signature = nacl.sign(msg, secretKey);
    return util.encodeBase64(signature);
  };

  // 2. TRANSFERT INTERNE (P2P)
  const transferP2P = (recipientId: ProfileId, fstar: number): boolean => {
    if (!wallet) {
      toast.error("Générez votre wallet local avant de transférer.");
      return false;
    }
    if (balances[activeProfileId] < fstar) {
      toast.error("Solde FStar insuffisant.");
      return false;
    }

    try {
      // Signature cryptographique locale (Nonce + Payload)
      const nonce = Date.now().toString();
      const payload = `${activeProfileId}-${recipientId}-${fstar}-${nonce}`;
      const sig = signPayload(payload);
      console.log(`[Proxy] Signature locale Ed25519 générée : ${sig.substring(0, 20)}...`);
    } catch (e) {
      toast.error("Erreur lors de la signature locale.");
      return false;
    }

    setBalances((prev) => ({
      ...prev,
      [activeProfileId]: prev[activeProfileId] - fstar,
      [recipientId]: prev[recipientId] + fstar,
    }));

    const newTx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      date: getFormattedDate(),
      type: "TRANSFERT",
      description: `Transfert Interne vers ${PROFILES[recipientId].name}`,
      amount: -fstar,
      senderName: activeProfile.name,
      recipientName: PROFILES[recipientId].name,
      status: "COMPLETED",
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.success(`Transfert réussi ! ${fstar} FStar envoyés.`);
    return true;
  };

  // 3. RECOMPENSER (L'Économie des Services)
  const rewardMember = (recipientId: ProfileId, fstar: number, serviceName: string): boolean => {
    if (!wallet) {
      toast.error("Générez votre wallet local d'abord.");
      return false;
    }
    if (balances[activeProfileId] < fstar) {
      toast.error("Solde FStar insuffisant.");
      return false;
    }

    try {
      // Signature locale pour la récompense
      const sig = signPayload(`${activeProfileId}-REWARD-${recipientId}-${fstar}`);
      console.log(`[Proxy] Récompense signée : ${sig.substring(0, 20)}...`);
    } catch (e) {
      return false;
    }

    setBalances((prev) => ({
      ...prev,
      [activeProfileId]: prev[activeProfileId] - fstar,
      [recipientId]: prev[recipientId] + fstar,
    }));

    const newTx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      date: getFormattedDate(),
      type: "RECOMPENSE",
      description: `Récompense rendue pour : ${serviceName}`,
      amount: -fstar,
      senderName: activeProfile.name,
      recipientName: PROFILES[recipientId].name,
      status: "COMPLETED",
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.success(`Récompense envoyée ! ${fstar} FSTART offerts.`);
    return true;
  };

  // 4. TRANSFERT EXTERNE (Sortie)
  const externalTransfer = (fstar: number) => {
    if (!wallet) {
      toast.error("Générez votre wallet local d'abord.");
      return false;
    }
    if (balances[activeProfileId] < fstar) {
      toast.error(`Solde FSTART insuffisant.`);
      return false;
    }

    setBalances((prev) => ({
      ...prev,
      [activeProfileId]: prev[activeProfileId] - fstar,
    }));

    const newTx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      date: getFormattedDate(),
      type: "SORTIE",
      description: `Transfert Externe (FStar sortis du système)`,
      amount: -fstar,
      status: "COMPLETED",
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.success(`${fstar} FSTART ont été expulsés du système vers l'externe.`);
    return true;
  };

  return (
    <FPayContext.Provider
      value={{
        activeProfile,
        profiles: PROFILES,
        balance,
        balances,
        transactions,
        wallet,
        changeProfile,
        generateWallet,
        buyFstart,
        transferP2P,
        rewardMember,
        externalTransfer,
      }}
    >
      {children}
    </FPayContext.Provider>
  );
};

export const useFPay = () => {
  const context = useContext(FPayContext);
  if (context === undefined) {
    throw new Error("useFPay must be used within an FPayProvider");
  }
  return context;
};

