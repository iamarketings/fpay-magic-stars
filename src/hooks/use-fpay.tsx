import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export type ProfileId = "USER" | "CREATOR" | "MERCHANT";

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
  type: "ACHAT" | "TRANSFERT" | "RETRAIT" | "CARTE_VIRTUELLE" | "PAYEMENT_MARCHAND";
  description: string;
  amountA: number; // Modif de Solde A (F-Stars)
  amountB: number; // Modif de Solde B (F-Credits / Ariary)
  senderName?: string;
  recipientName?: string;
  status: "COMPLETED" | "PENDING";
  fees?: number; // Frais en Ariary
}

export interface VirtualCard {
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
  provider: "Visa" | "Mastercard";
  status: "ACTIVE" | "USED";
}

interface FPayContextType {
  activeProfile: Profile;
  profiles: Record<ProfileId, Profile>;
  balances: Record<ProfileId, { soldeA: number; soldeB: number }>;
  transactions: Transaction[];
  virtualCards: VirtualCard[];
  exchangeRate: number; // 1 F-Star = X Ariary
  changeProfile: (id: ProfileId) => void;
  buyStarsCB: (stars: number, euro: number) => void;
  buyStarsMobileMoney: (stars: number, ariary: number, operator: string, phone: string) => void;
  transferP2P: (recipientId: ProfileId, stars: number) => boolean;
  withdrawMobileMoney: (operator: string, phone: string, amountAr: number) => boolean;
  withdrawCashPoint: (location: string, amountAr: number) => { code: string; fees: number } | null;
  generateVirtualCard: (amountAr: number, provider: "Visa" | "Mastercard") => boolean;
  payMerchant: (merchantId: ProfileId, source: "SOLDE_A" | "SOLDE_B", amountAr: number) => boolean;
}

const FPayContext = createContext<FPayContextType | undefined>(undefined);

const PROFILES: Record<ProfileId, Profile> = {
  USER: {
    id: "USER",
    name: "Jean-Luc",
    role: "Utilisateur Standard",
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
  MERCHANT: {
    id: "MERCHANT",
    name: "ShopMada",
    role: "Marchand E-commerce",
    avatar: "SM",
    email: "contact@shopmada.mg",
  },
};

const INITIAL_BALANCES: Record<ProfileId, { soldeA: number; soldeB: number }> = {
  USER: { soldeA: 250, soldeB: 1500 },
  CREATOR: { soldeA: 20, soldeB: 24000 },
  MERCHANT: { soldeA: 0, soldeB: 85000 },
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_1",
    date: "01/06/2026 14:32",
    type: "ACHAT",
    description: "Achat Pack 120 Étoiles (CB via Stripe)",
    amountA: 120,
    amountB: 0,
    status: "COMPLETED",
    fees: 0,
  },
  {
    id: "tx_2",
    date: "31/05/2026 18:15",
    type: "TRANSFERT",
    description: "Soutien envoyé à Clara Stream",
    amountA: -50,
    amountB: 0,
    senderName: "Jean-Luc",
    recipientName: "Clara Stream",
    status: "COMPLETED",
  },
  {
    id: "tx_3",
    date: "30/05/2026 10:00",
    type: "RETRAIT",
    description: "Retrait vers Mvola",
    amountA: 0,
    amountB: -50000,
    status: "COMPLETED",
    fees: 1000,
  },
];

export const FPayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProfileId, setActiveProfileId] = useState<ProfileId>("USER");
  const [balances, setBalances] = useState(INITIAL_BALANCES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>([]);
  const exchangeRate = 1; // 1 F-Star = 1 Ariary

  const activeProfile = PROFILES[activeProfileId];

  // Alterner de rôle
  const changeProfile = (id: ProfileId) => {
    setActiveProfileId(id);
    toast.info(`Profil changé : ${PROFILES[id].name} (${PROFILES[id].role})`);
  };

  // Obtenir la date courante formatée
  const getFormattedDate = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  // Acheter des F-Stars par CB (Stripe) -> Crédite le Solde A
  const buyStarsCB = (stars: number, euro: number) => {
    setBalances((prev) => ({
      ...prev,
      [activeProfileId]: {
        ...prev[activeProfileId],
        soldeA: prev[activeProfileId].soldeA + stars,
      },
    }));

    const newTx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      date: getFormattedDate(),
      type: "ACHAT",
      description: `Achat Pack ${stars} F-Stars (Stripe CB)`,
      amountA: stars,
      amountB: 0,
      status: "COMPLETED",
      fees: 0,
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.success(`Succès ! Pack de ${stars} F-Stars ajouté à votre Solde d'Envoi (Stripe CB).`);
  };

  // Acheter des F-Stars par Mobile Money -> Crédite le Solde A
  const buyStarsMobileMoney = (stars: number, ariary: number, operator: string, phone: string) => {
    setBalances((prev) => ({
      ...prev,
      [activeProfileId]: {
        ...prev[activeProfileId],
        soldeA: prev[activeProfileId].soldeA + stars,
      },
    }));

    const newTx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      date: getFormattedDate(),
      type: "ACHAT",
      description: `Achat ${stars} F-Stars via ${operator} (${phone})`,
      amountA: stars,
      amountB: 0,
      status: "COMPLETED",
      fees: 0,
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.success(`Succès ! ${stars} F-Stars ajoutés via ${operator}.`);
  };

  // Transfert P2P (FPay vers FPay) -> Débite Solde A chez l'émetteur, Crédite Solde B (F-Credits) chez le récepteur
  const transferP2P = (recipientId: ProfileId, stars: number): boolean => {
    if (balances[activeProfileId].soldeA < stars) {
      toast.error("Solde d'Envoi (F-Stars) insuffisant.");
      return false;
    }

    const ariaryEquivalent = stars * exchangeRate;

    setBalances((prev) => {
      // Débiter l'émetteur (Solde A)
      const senderNewA = prev[activeProfileId].soldeA - stars;
      
      // Créditer le récepteur (Solde B en Ariary)
      const recipientNewB = prev[recipientId].soldeB + ariaryEquivalent;

      return {
        ...prev,
        [activeProfileId]: { ...prev[activeProfileId], soldeA: senderNewA },
        [recipientId]: { ...prev[recipientId], soldeB: recipientNewB },
      };
    });

    const newTx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      date: getFormattedDate(),
      type: "TRANSFERT",
      description: `Transfert de ${stars} F-Stars vers ${PROFILES[recipientId].name}`,
      amountA: -stars,
      amountB: 0,
      senderName: activeProfile.name,
      recipientName: PROFILES[recipientId].name,
      status: "COMPLETED",
    };

    // Ajouter aussi la transaction reçue pour le destinataire dans l'historique
    const newTxRecipient: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      date: getFormattedDate(),
      type: "TRANSFERT",
      description: `Reçu de ${activeProfile.name} (Soutien converted)`,
      amountA: 0,
      amountB: ariaryEquivalent,
      senderName: activeProfile.name,
      recipientName: PROFILES[recipientId].name,
      status: "COMPLETED",
    };

    setTransactions((prev) => [newTx, newTxRecipient, ...prev]);
    toast.success(`Transfert réussi ! ${stars} F-Stars envoyés à ${PROFILES[recipientId].name} (${ariaryEquivalent} Ar crédités sur ses Gains).`);
    return true;
  };

  // Retrait vers Mobile Money -> Débite Solde B
  const withdrawMobileMoney = (operator: string, phone: string, amountAr: number): boolean => {
    const fee = Math.round(amountAr * 0.02); // 2% de frais
    const totalDeducted = amountAr + fee;

    if (balances[activeProfileId].soldeB < totalDeducted) {
      toast.error(`Solde de Gains insuffisant. Il vous faut ${totalDeducted} Ar (y compris ${fee} Ar de frais).`);
      return false;
    }

    setBalances((prev) => ({
      ...prev,
      [activeProfileId]: {
        ...prev[activeProfileId],
        soldeB: prev[activeProfileId].soldeB - totalDeducted,
      },
    }));

    const newTx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      date: getFormattedDate(),
      type: "RETRAIT",
      description: `Retrait Mobile Money (${operator} - ${phone})`,
      amountA: 0,
      amountB: -amountAr,
      status: "COMPLETED",
      fees: fee,
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.success(`Retrait de ${amountAr} Ar initié avec succès vers ${phone} (Frais: ${fee} Ar).`);
    return true;
  };

  // Retrait en Point Cash -> Débite Solde B
  const withdrawCashPoint = (location: string, amountAr: number) => {
    const fee = Math.round(amountAr * 0.03); // 3% de frais en point cash
    const totalDeducted = amountAr + fee;

    if (balances[activeProfileId].soldeB < totalDeducted) {
      toast.error(`Solde de Gains insuffisant. Il vous faut ${totalDeducted} Ar (y compris ${fee} Ar de frais).`);
      return null;
    }

    setBalances((prev) => ({
      ...prev,
      [activeProfileId]: {
        ...prev[activeProfileId],
        soldeB: prev[activeProfileId].soldeB - totalDeducted,
      },
    }));

    const code = `VOUCH-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      date: getFormattedDate(),
      type: "RETRAIT",
      description: `Bon Cash généré pour retrait à ${location}`,
      amountA: 0,
      amountB: -amountAr,
      status: "PENDING",
      fees: fee,
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.success(`Bon de retrait généré ! Présentez le code ${code} à ${location}.`);
    return { code, fees: fee };
  };

  // Générer une Carte Bleue Virtuelle -> Débite Solde B
  const generateVirtualCard = (amountAr: number, provider: "Visa" | "Mastercard"): boolean => {
    if (balances[activeProfileId].soldeB < amountAr) {
      toast.error("Solde de Gains insuffisant pour approvisionner cette carte.");
      return false;
    }

    setBalances((prev) => ({
      ...prev,
      [activeProfileId]: {
        ...prev[activeProfileId],
        soldeB: prev[activeProfileId].soldeB - amountAr,
      },
    }));

    // Créer la carte
    const cardNumber = `${provider === "Visa" ? "4" : "5"}${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const expiry = "12/28";
    const cvv = `${Math.floor(100 + Math.random() * 900)}`;

    const newCard: VirtualCard = {
      cardNumber,
      expiry,
      cvv,
      amount: amountAr,
      provider,
      status: "ACTIVE",
    };

    setVirtualCards((prev) => [newCard, ...prev]);

    const newTx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      date: getFormattedDate(),
      type: "CARTE_VIRTUELLE",
      description: `Génération Carte Virtuelle ${provider} (Débit Gains)`,
      amountA: 0,
      amountB: -amountAr,
      status: "COMPLETED",
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.success(`Votre carte virtuelle ${provider} créditée de ${amountAr} Ar a été créée !`);
    return true;
  };

  // Payer un marchand via l'API Marchand -> Débite Solde A ou B de l'acheteur, Crédite Solde B du marchand (moins 1.5% frais)
  const payMerchant = (merchantId: ProfileId, source: "SOLDE_A" | "SOLDE_B", amountAr: number): boolean => {
    const fee = Math.round(amountAr * 0.015); // 1.5% frais marchand
    const creditAmount = amountAr - fee;

    if (source === "SOLDE_A") {
      const starsNeeded = amountAr / exchangeRate;
      if (balances[activeProfileId].soldeA < starsNeeded) {
        toast.error(`Solde d'Envoi insuffisant. Il vous faut ${starsNeeded} F-Stars.`);
        return false;
      }

      setBalances((prev) => ({
        ...prev,
        [activeProfileId]: {
          ...prev[activeProfileId],
          soldeA: prev[activeProfileId].soldeA - starsNeeded,
        },
        [merchantId]: {
          ...prev[merchantId],
          soldeB: prev[merchantId].soldeB + creditAmount,
        },
      }));

      const newTx: Transaction = {
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        date: getFormattedDate(),
        type: "PAYEMENT_MARCHAND",
        description: `Paiement API Marchand (${PROFILES[merchantId].name}) - Source F-Stars`,
        amountA: -starsNeeded,
        amountB: 0,
        senderName: activeProfile.name,
        recipientName: PROFILES[merchantId].name,
        status: "COMPLETED",
      };

      const newTxMerchant: Transaction = {
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        date: getFormattedDate(),
        type: "PAYEMENT_MARCHAND",
        description: `Encaissement API Marchand - Reçu de ${activeProfile.name}`,
        amountA: 0,
        amountB: creditAmount,
        senderName: activeProfile.name,
        recipientName: PROFILES[merchantId].name,
        status: "COMPLETED",
        fees: fee,
      };

      setTransactions((prev) => [newTx, newTxMerchant, ...prev]);
    } else {
      if (balances[activeProfileId].soldeB < amountAr) {
        toast.error(`Solde de Gains insuffisant. Il vous faut ${amountAr} Ar.`);
        return false;
      }

      setBalances((prev) => ({
        ...prev,
        [activeProfileId]: {
          ...prev[activeProfileId],
          soldeB: prev[activeProfileId].soldeB - amountAr,
        },
        [merchantId]: {
          ...prev[merchantId],
          soldeB: prev[merchantId].soldeB + creditAmount,
        },
      }));

      const newTx: Transaction = {
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        date: getFormattedDate(),
        type: "PAYEMENT_MARCHAND",
        description: `Paiement API Marchand (${PROFILES[merchantId].name}) - Source Gains`,
        amountA: 0,
        amountB: -amountAr,
        senderName: activeProfile.name,
        recipientName: PROFILES[merchantId].name,
        status: "COMPLETED",
      };

      const newTxMerchant: Transaction = {
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        date: getFormattedDate(),
        type: "PAYEMENT_MARCHAND",
        description: `Encaissement API Marchand - Reçu de ${activeProfile.name}`,
        amountA: 0,
        amountB: creditAmount,
        senderName: activeProfile.name,
        recipientName: PROFILES[merchantId].name,
        status: "COMPLETED",
        fees: fee,
      };

      setTransactions((prev) => [newTx, newTxMerchant, ...prev]);
    }

    toast.success(`Paiement marchand de ${amountAr} Ar effectué. Le marchand a été crédité de ${creditAmount} Ar (Frais: ${fee} Ar).`);
    return true;
  };

  return (
    <FPayContext.Provider
      value={{
        activeProfile,
        profiles: PROFILES,
        balances,
        transactions,
        virtualCards,
        exchangeRate,
        changeProfile,
        buyStarsCB,
        buyStarsMobileMoney,
        transferP2P,
        withdrawMobileMoney,
        withdrawCashPoint,
        generateVirtualCard,
        payMerchant,
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
