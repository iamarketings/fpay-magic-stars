import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardDesktop } from "../components/DashboardDesktop";
import { DashboardMobile } from "../components/DashboardMobile";
import { OnboardingFlow } from "../components/OnboardingFlow";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

export type Transaction = {
  id: string;
  type: "IN" | "OUT" | "REWARD" | "BUY";
  amount: number;
  date: string;
  counterparty?: string;
  status: "COMPLETED" | "PENDING";
};

type Tab = "home" | "historique" | "profil" | "acheter" | "recevoir" | "envoyer" | "recompenser";

function Dashboard() {
  const [onboardingStep, setOnboardingStep] = useState<"LOGIN_SIGNUP" | "KYC_CONFIG" | "WALLET_CREATION" | "ACTIVE">("LOGIN_SIGNUP");
  const [userProfile, setUserProfile] = useState<{
    email: string;
    name: string;
    phone: string;
    username: string;
    avatar: string;
    mmOperator: "TELMA" | "ORANGE" | "AIRTEL";
    mmNumber: string;
  } | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [walletPin, setWalletPin] = useState("");
  const [kycStatus, setKycStatus] = useState<"NONE" | "VERIFIED">("NONE");

  const [tab, setTab] = useState<Tab>("home");
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // ACHAT STATE
  const [purchaseStep, setPurchaseStep] = useState<"AMOUNT" | "PAYMENT">("AMOUNT");
  const [purchaseAmount, setPurchaseAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "MM" | null>(null);
  const [mmPhone, setMmPhone] = useState("");
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // ENVOI STATE
  const [giftAmt, setGiftAmt] = useState("");
  const [recipientQuery, setRecipientQuery] = useState("");
  const [recipientNetwork, setRecipientNetwork] = useState<"FPAY" | "MADASTARS">("FPAY");
  const [giftLoading, setGiftLoading] = useState(false);

  // RECOMPENSE STATE
  const [rewardAmt, setRewardAmt] = useState("");
  const [rewardRecipient, setRewardRecipient] = useState("");
  const [rewardService, setRewardService] = useState("");
  const [rewardLoading, setRewardLoading] = useState(false);

  // Reconnexion automatique au démarrage
  useEffect(() => {
    const savedAccount = localStorage.getItem("fpay_mock_account");
    if (savedAccount) {
      try {
        const acc = JSON.parse(savedAccount);
        const username = acc.username;
        const savedKyc = localStorage.getItem(`fpay_kyc_${username}`);
        const savedWallet = localStorage.getItem(`fpay_wallet_${username}`);

        if (savedKyc && savedWallet) {
          const k = JSON.parse(savedKyc);
          const w = JSON.parse(savedWallet);
          
          setUserProfile({
            email: acc.email,
            name: `${k.firstName} ${k.lastName}`,
            phone: k.phone,
            username: username,
            avatar: username.substring(0, 2).toUpperCase(),
            mmOperator: acc.mmOperator || "TELMA",
            mmNumber: acc.mmNumber || ""
          });
          setWallet(w);
          setWalletPin(w.pin || "");
          setKycStatus("VERIFIED");
          setOnboardingStep("ACTIVE");
          
          // Pré-remplir le numéro de paiement MM
          setMmPhone(acc.mmNumber || "");

          // Charger le solde et les transactions
          const savedBalance = localStorage.getItem(`fpay_balance_${username}`);
          if (savedBalance) setBalance(parseFloat(savedBalance));
          const savedTxs = localStorage.getItem(`fpay_txs_${username}`);
          if (savedTxs) setTransactions(JSON.parse(savedTxs));
        } else if (savedKyc) {
          setOnboardingStep("WALLET_CREATION");
        } else {
          setOnboardingStep("KYC_CONFIG");
        }
      } catch (e) {
        console.error("Erreur de reconnexion auto", e);
      }
    }
  }, []);

  const handleOnboardingComplete = (
    profile: {
      email: string;
      name: string;
      phone: string;
      username: string;
      avatar: string;
      mmOperator: "TELMA" | "ORANGE" | "AIRTEL";
      mmNumber: string;
    },
    walletData: { publicKey: string; secret: string },
    pinCode: string
  ) => {
    setUserProfile(profile);
    setWallet(walletData);
    setWalletPin(pinCode);
    setKycStatus("VERIFIED");
    setOnboardingStep("ACTIVE");
    
    // Pré-remplir le numéro de paiement MM
    setMmPhone(profile.mmNumber);

    // Initialiser les données utilisateur persistées
    const savedBalance = localStorage.getItem(`fpay_balance_${profile.username}`);
    if (savedBalance) {
      setBalance(parseFloat(savedBalance));
    } else {
      setBalance(0);
      localStorage.setItem(`fpay_balance_${profile.username}`, "0");
    }

    const savedTxs = localStorage.getItem(`fpay_txs_${profile.username}`);
    if (savedTxs) {
      setTransactions(JSON.parse(savedTxs));
    } else {
      setTransactions([]);
      localStorage.setItem(`fpay_txs_${profile.username}`, JSON.stringify([]));
    }
  };

  const handleGenerate = () => {
    if (!userProfile) return;
    // Régénère les clés Ed25519 en conservant le profil et le code PIN
    const pub = "FPAY_" + Math.random().toString(36).substring(2, 15).toUpperCase() + "_ED25519";
    const sec = "sec_" + Math.random().toString(36).substring(2, 20);
    const newWallet = { publicKey: pub, secret: sec, pin: walletPin };
    setWallet(newWallet);
    localStorage.setItem(`fpay_wallet_${userProfile.username}`, JSON.stringify(newWallet));
    toast.success("Nouvelles clés Ed25519 générées !");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier");
  };

  function handlePurchase(e: React.FormEvent) {
    e.preventDefault();
    const amt = typeof purchaseAmount === "number" ? purchaseAmount : parseFloat(purchaseAmount);
    if (!amt || amt <= 0) return;
    if (paymentMethod === "MM" && !mmPhone) {
      toast.error("Veuillez entrer un numéro de téléphone.");
      return;
    }
    setPurchaseLoading(true);
    setTimeout(() => {
      const newBalance = balance + amt;
      setBalance(newBalance);
      
      const newTx: Transaction = {
        id: "TX_" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        type: "BUY",
        amount: amt,
        date: new Date().toISOString(),
        counterparty: `Achat via ${paymentMethod === "STRIPE" ? "Stripe" : "Mobile Money"}`,
        status: "COMPLETED"
      };
      
      const newTxs = [newTx, ...transactions];
      setTransactions(newTxs);
      
      if (userProfile?.username) {
        localStorage.setItem(`fpay_balance_${userProfile.username}`, newBalance.toString());
        localStorage.setItem(`fpay_txs_${userProfile.username}`, JSON.stringify(newTxs));
      }

      setPurchaseLoading(false);
      setPurchaseStep("AMOUNT");
      setPurchaseAmount("");
      setMmPhone("");
      toast.success(`${amt} FStar générés avec succès !`);
      setTab("home");
    }, 1500);
  }

  function handleSendGift(e: React.FormEvent) {
    e.preventDefault();
    const fstars = parseFloat(giftAmt);
    if (!fstars || !recipientQuery.trim()) { toast.error("Remplissez tous les champs."); return; }
    if (recipientQuery.trim().length < 8) {
      toast.error("La clé publique Ed25519 semble invalide.");
      return;
    }
    if (balance < fstars) {
      toast.error("Solde FStar insuffisant.");
      return;
    }
    setGiftLoading(true);
    setTimeout(() => {
      const newBalance = balance - fstars;
      setBalance(newBalance);
      
      const newTx: Transaction = {
        id: "TX_" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        type: "OUT",
        amount: fstars,
        date: new Date().toISOString(),
        counterparty: recipientQuery,
        status: "COMPLETED"
      };

      const newTxs = [newTx, ...transactions];
      setTransactions(newTxs);

      if (userProfile?.username) {
        localStorage.setItem(`fpay_balance_${userProfile.username}`, newBalance.toString());
        localStorage.setItem(`fpay_txs_${userProfile.username}`, JSON.stringify(newTxs));
      }

      toast.success(`Transfert envoyé vers la clé ${recipientQuery.substring(0, 8)}...`);
      setGiftLoading(false);
      setGiftAmt("");
      setRecipientQuery("");
      setTab("home");
    }, 1500);
  }

  function handleReward(e: React.FormEvent) {
    e.preventDefault();
    const fstars = parseFloat(rewardAmt);
    if (!fstars || !rewardService.trim() || !rewardRecipient.trim()) { toast.error("Remplissez tous les champs."); return; }
    if (rewardRecipient.trim().length < 8) {
      toast.error("La clé publique Ed25519 semble invalide.");
      return;
    }
    if (balance < fstars) {
      toast.error("Solde FStar insuffisant.");
      return;
    }
    setRewardLoading(true);
    setTimeout(() => {
      const newBalance = balance - fstars;
      setBalance(newBalance);
      
      const newTx: Transaction = {
        id: "TX_" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        type: "REWARD",
        amount: fstars,
        date: new Date().toISOString(),
        counterparty: `${rewardRecipient} (${rewardService})`,
        status: "COMPLETED"
      };

      const newTxs = [newTx, ...transactions];
      setTransactions(newTxs);

      if (userProfile?.username) {
        localStorage.setItem(`fpay_balance_${userProfile.username}`, newBalance.toString());
        localStorage.setItem(`fpay_txs_${userProfile.username}`, JSON.stringify(newTxs));
      }

      toast.success(`Récompense signée pour la clé ${rewardRecipient.substring(0, 8)}...`);
      setRewardLoading(false);
      setRewardAmt("");
      setRewardService("");
      setRewardRecipient("");
      setTab("home");
    }, 1500);
  }

  if (onboardingStep !== "ACTIVE") {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const activeProfile = userProfile ? {
    name: userProfile.name,
    email: userProfile.email,
    avatar: userProfile.avatar,
    username: userProfile.username
  } : {
    name: "Utilisateur Sandbox",
    email: "sandbox@fpay.com",
    avatar: "US",
    username: "sandbox"
  };


  return (
    <>
      <div className="hidden md:block">
        <DashboardDesktop
          tab={tab}
          setTab={setTab}
          wallet={wallet}
          balance={balance}
          transactions={transactions}
          activeProfile={activeProfile}
          handleGenerate={handleGenerate}
          handleCopy={handleCopy}
          purchaseStep={purchaseStep}
          setPurchaseStep={setPurchaseStep}
          purchaseAmount={purchaseAmount}
          setPurchaseAmount={setPurchaseAmount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          mmPhone={mmPhone}
          setMmPhone={setMmPhone}
          purchaseLoading={purchaseLoading}
          handlePurchase={handlePurchase}
          giftAmt={giftAmt}
          setGiftAmt={setGiftAmt}
          recipientQuery={recipientQuery}
          setRecipientQuery={setRecipientQuery}
          recipientNetwork={recipientNetwork}
          setRecipientNetwork={setRecipientNetwork}
          giftLoading={giftLoading}
          handleSendGift={handleSendGift}
          rewardAmt={rewardAmt}
          setRewardAmt={setRewardAmt}
          rewardRecipient={rewardRecipient}
          setRewardRecipient={setRewardRecipient}
          rewardService={rewardService}
          setRewardService={setRewardService}
          rewardLoading={rewardLoading}
          handleReward={handleReward}
          walletPin={walletPin}
          kycStatus={kycStatus}
          mmOperator={userProfile?.mmOperator}
          mmNumber={userProfile?.mmNumber}
        />
      </div>
      <div className="block md:hidden">
        <DashboardMobile
          tab={tab}
          setTab={setTab}
          wallet={wallet}
          balance={balance}
          transactions={transactions}
          activeProfile={activeProfile}
          handleGenerate={handleGenerate}
          handleCopy={handleCopy}
          purchaseStep={purchaseStep}
          setPurchaseStep={setPurchaseStep}
          purchaseAmount={purchaseAmount}
          setPurchaseAmount={setPurchaseAmount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          mmPhone={mmPhone}
          setMmPhone={setMmPhone}
          purchaseLoading={purchaseLoading}
          handlePurchase={handlePurchase}
          giftAmt={giftAmt}
          setGiftAmt={setGiftAmt}
          recipientQuery={recipientQuery}
          setRecipientQuery={setRecipientQuery}
          recipientNetwork={recipientNetwork}
          setRecipientNetwork={setRecipientNetwork}
          giftLoading={giftLoading}
          handleSendGift={handleSendGift}
          rewardAmt={rewardAmt}
          setRewardAmt={setRewardAmt}
          rewardRecipient={rewardRecipient}
          setRewardRecipient={setRewardRecipient}
          rewardService={rewardService}
          setRewardService={setRewardService}
          rewardLoading={rewardLoading}
          handleReward={handleReward}
          walletPin={walletPin}
          kycStatus={kycStatus}
          mmOperator={userProfile?.mmOperator}
          mmNumber={userProfile?.mmNumber}
        />
      </div>
    </>
  );
}
