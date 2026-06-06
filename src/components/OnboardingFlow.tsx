import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Lock,
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UploadCloud,
  Check,
  Key,
  Globe,
  Loader2
} from "lucide-react";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import fpayLogo from "@/assets/fpay-logo.png";

interface OnboardingFlowProps {
  onComplete: (
    profile: {
      email: string;
      name: string;
      phone: string;
      username: string;
      avatar: string;
      mmOperator: "TELMA" | "ORANGE" | "AIRTEL";
      mmNumber: string;
    },
    wallet: { publicKey: string; secret: string },
    pin: string
  ) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // STEP 1: AUTH
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mmOperator, setMmOperator] = useState<"TELMA" | "ORANGE" | "AIRTEL">("TELMA");
  const [mmNumber, setMmNumber] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // STEP 2: KYC
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Madagascar");
  const [uploadProgressId, setUploadProgressId] = useState<number | null>(null);
  const [uploadProgressSelfie, setUploadProgressSelfie] = useState<number | null>(null);
  const [kycValidating, setKycValidating] = useState(false);
  const [kycSuccess, setKycSuccess] = useState(false);

  // STEP 3: WALLET
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdWallet, setCreatedWallet] = useState<{ publicKey: string; secret: string } | null>(null);

  // Simulation Upload
  const simulateUpload = (type: "ID" | "SELFIE") => {
    if (type === "ID") {
      setUploadProgressId(0);
      let p = 0;
      const interval = setInterval(() => {
        p += 20;
        setUploadProgressId(p);
        if (p >= 100) {
          clearInterval(interval);
          toast.success("Pièce d'identité téléversée !");
        }
      }, 200);
    } else {
      setUploadProgressSelfie(0);
      let p = 0;
      const interval = setInterval(() => {
        p += 25;
        setUploadProgressSelfie(p);
        if (p >= 100) {
          clearInterval(interval);
          toast.success("Selfie d'identité téléversé !");
        }
      }, 200);
    }
  };

  // Handle Auth submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !username)) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    
    if (!isLogin) {
      if (!mmNumber) {
        toast.error("Veuillez renseigner votre numéro Mobile Money.");
        return;
      }
      
      // Validation Madagascar Mobile Money
      const cleanedNum = mmNumber.replace(/\s+/g, "");
      let isValid = false;
      let errorMsg = "";
      
      if (mmOperator === "TELMA") {
        const telmaRegex = /^(034|038|\+26134|\+26138)\d{7}$/;
        isValid = telmaRegex.test(cleanedNum);
        errorMsg = "Format Telma invalide. Doit commencer par 034, 038 ou +261 34/38 suivi de 7 chiffres.";
      } else if (mmOperator === "ORANGE") {
        const orangeRegex = /^(032|037|\+26132|\+26137)\d{7}$/;
        isValid = orangeRegex.test(cleanedNum);
        errorMsg = "Format Orange invalide. Doit commencer par 032, 037 ou +261 32/37 suivi de 7 chiffres.";
      } else if (mmOperator === "AIRTEL") {
        const airtelRegex = /^(033|\+26133)\d{7}$/;
        isValid = airtelRegex.test(cleanedNum);
        errorMsg = "Format Airtel invalide. Doit commencer par 033 ou +261 33 suivi de 7 chiffres.";
      }
      
      if (!isValid) {
        toast.error(errorMsg);
        return;
      }
    }

    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      if (isLogin) {
        // Mock Login
        const savedAccount = localStorage.getItem("fpay_mock_account");
        if (savedAccount) {
          const acc = JSON.parse(savedAccount);
          if (acc.email === email && acc.password === password) {
            toast.success(`Bon retour, ${acc.username} !`);
            // Load their profile
            setEmail(acc.email);
            setUsername(acc.username);
            if (acc.mmOperator) setMmOperator(acc.mmOperator);
            if (acc.mmNumber) setMmNumber(acc.mmNumber);
            
            // Check if they already have KYC and Wallet
            const savedKyc = localStorage.getItem(`fpay_kyc_${acc.username}`);
            const savedWallet = localStorage.getItem(`fpay_wallet_${acc.username}`);
            if (savedKyc && savedWallet) {
              const k = JSON.parse(savedKyc);
              const w = JSON.parse(savedWallet);
              onComplete(
                {
                  email: acc.email,
                  name: `${k.firstName} ${k.lastName}`,
                  phone: k.phone,
                  username: acc.username,
                  avatar: acc.username.substring(0, 2).toUpperCase(),
                  mmOperator: acc.mmOperator || "TELMA",
                  mmNumber: acc.mmNumber || ""
                },
                w,
                w.pin
              );
              return;
            }
          }
        }
        toast.info("Aucun compte persistant trouvé ou identifiants incorrects. Création d'une nouvelle session.");
      }
      toast.success("Compte authentifié avec succès !");
      setPhone(mmNumber); // Pré-remplir le numéro KYC
      setStep(2);
    }, 1000);
  };

  // Handle KYC submission
  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone) {
      toast.error("Veuillez renseigner toutes vos informations civiles.");
      return;
    }
    if (uploadProgressId !== 100 || uploadProgressSelfie !== 100) {
      toast.error("Veuillez téléverser les documents requis.");
      return;
    }
    setKycValidating(true);
    setTimeout(() => {
      setKycValidating(false);
      setKycSuccess(true);
      toast.success("KYC Validé par la Sandbox FPay !");
      setTimeout(() => {
        setStep(3);
      }, 1500);
    }, 2000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.username || !data.email || !data.publicKey || !data.secret || !data.pin) {
          toast.error("Format de sauvegarde invalide. Champs requis manquants.");
          return;
        }

        // Restore account
        const account = {
          email: data.email,
          password: data.password || "restored_fpay_password",
          username: data.username,
          mmOperator: data.mmOperator || "TELMA",
          mmNumber: data.mmNumber || ""
        };
        
        const kyc = {
          firstName: data.firstName || data.username,
          lastName: data.lastName || "",
          phone: data.phone || data.mmNumber || "",
          country: data.country || "Madagascar"
        };

        const wallet = {
          publicKey: data.publicKey,
          secret: data.secret,
          pin: data.pin
        };

        // Save to localstorage
        localStorage.setItem("fpay_mock_account", JSON.stringify(account));
        localStorage.setItem(`fpay_kyc_${data.username}`, JSON.stringify(kyc));
        localStorage.setItem(`fpay_wallet_${data.username}`, JSON.stringify(wallet));

        toast.success("Portefeuille et profil restaurés avec succès !");
        
        // Complete onboarding directly
        onComplete(
          {
            email: account.email,
            name: `${kyc.firstName} ${kyc.lastName}`,
            phone: kyc.phone,
            username: account.username,
            avatar: account.username.substring(0, 2).toUpperCase(),
            mmOperator: account.mmOperator as any,
            mmNumber: account.mmNumber
          },
          wallet,
          wallet.pin
        );
      } catch (err) {
        toast.error("Erreur lors de la lecture du fichier JSON.");
      }
    };
    reader.readAsText(file);
  };

  // Run Wallet generation
  const handleWalletGeneration = () => {
    if (pin.length !== 6 || isNaN(Number(pin))) {
      toast.error("Le code PIN doit être composé de 6 chiffres.");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("Les codes PIN ne correspondent pas.");
      return;
    }

    setIsGenerating(true);
    setGenerationLogs([]);

    const logMessages = [
      "Initialisation de l'entropie locale...",
      "Génération d'une paire de clés cryptographiques via l'algorithme Ed25519...",
      "Clé publique générée avec succès.",
      "Dérivation d'une clé de session via SHA-512 basée sur votre code PIN...",
      "Chiffrement de la clé privée Ed25519...",
      "Sauvegarde sécurisée dans le stockage local du navigateur...",
      "Portefeuille prêt et sécurisé !"
    ];

    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < logMessages.length) {
        setGenerationLogs(prev => [...prev, `[system] ${logMessages[logIdx]}`]);
        logIdx++;
      } else {
        clearInterval(interval);
        
        // Generate actual Ed25519 Keypair
        const keyPair = nacl.sign.keyPair();
        const pubKeyStr = "FPAY_" + util.encodeBase64(keyPair.publicKey).substring(0, 32) + "_ED25519";
        const privKeyStr = util.encodeBase64(keyPair.secretKey);

        const newWallet = {
          publicKey: pubKeyStr,
          secret: privKeyStr,
          pin: pin // mock pin verification
        };

        setCreatedWallet(newWallet);
        setIsGenerating(false);
        toast.success("Portefeuille cryptographique généré localement !");
      }
    }, 400);
  };

  const handleFinishOnboarding = () => {
    if (!createdWallet) return;
    
    const profile = {
      email,
      name: `${firstName} ${lastName}`,
      phone,
      username,
      avatar: username ? username.substring(0, 2).toUpperCase() : firstName.substring(0, 2).toUpperCase(),
      mmOperator,
      mmNumber
    };

    // Save state to localStorage for persistence
    localStorage.setItem("fpay_mock_account", JSON.stringify({ email, password, username, mmOperator, mmNumber }));
    localStorage.setItem(`fpay_kyc_${username}`, JSON.stringify({ firstName, lastName, phone, country }));
    localStorage.setItem(`fpay_wallet_${username}`, JSON.stringify(createdWallet));

    onComplete(profile, createdWallet, pin);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8 font-sans selection:bg-[#1864FF]/20 text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img src={fpayLogo} alt="FPay Logo" className="mx-auto h-12 w-auto rounded-xl shadow-sm" />
        <h2 className="mt-6 text-3xl font-black text-slate-900 tracking-tight">
          Sandbox FPay
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Rejoignez le réseau d'échange et configurez votre wallet non-custodial.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white border border-slate-200 py-8 px-6 shadow-xl rounded-3xl sm:px-10 relative overflow-hidden">
          
          {/* STEP HEADER */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <span className="text-xs font-bold text-[#1864FF] uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded">
              Étape {step} sur 3
            </span>
            <span className="text-xs font-bold text-slate-400">
              {step === 1 ? "Authentification" : step === 2 ? "Vérification KYC" : "Création du Portefeuille"}
            </span>
          </div>

          {/* STEP 1: AUTHENTICATION */}
          {step === 1 && (
            <div>
              <form onSubmit={handleAuthSubmit} className="space-y-5">
                <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${!isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-850"}`}
                  >
                    Inscription
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-850"}`}
                  >
                    Connexion
                  </button>
                </div>

                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Nom d'utilisateur</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="alexandre"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#1864FF] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="alexandre@fpay.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#1864FF] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#1864FF] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Opérateur Mobile Money</label>
                      <select
                        value={mmOperator}
                        onChange={e => setMmOperator(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:border-[#1864FF] focus:bg-white outline-none transition-all text-slate-700 font-bold"
                      >
                        <option value="TELMA">Telma (Mvola)</option>
                        <option value="ORANGE">Orange Money</option>
                        <option value="AIRTEL">Airtel Money</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">N° Mobile Money (Mada)</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={mmNumber}
                          onChange={e => setMmNumber(e.target.value)}
                          placeholder={
                            mmOperator === "TELMA" ? "034 XX XXX XX" :
                            mmOperator === "ORANGE" ? "032 XX XXX XX" : "033 XX XXX XX"
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#1864FF] focus:bg-white outline-none transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#1864FF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all duration-250 cursor-pointer"
                >
                  {authLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? "Se connecter" : "Créer mon compte"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-[#1864FF] hover:text-blue-700 cursor-pointer">
                  <UploadCloud className="h-4 w-4" />
                  <span>Restaurer mon portefeuille (backup JSON)</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportBackup}
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: KYC */}
          {step === 2 && !kycSuccess && (
            <form onSubmit={handleKycSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Prénom</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Alexandre"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1864FF] focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Nom</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Raharijaona"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1864FF] focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+261 34 00 000 00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#1864FF] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Pays de résidence</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#1864FF] focus:bg-white outline-none transition-all text-slate-700"
                    >
                      <option value="Madagascar">Madagascar</option>
                      <option value="France">France</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* MOCK DOC UPLOAD */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 block">Documents d'identité requis (KYC Niveau 2)</label>
                
                {/* ID upload box */}
                <div className="border border-dashed border-slate-200 hover:border-[#1864FF] rounded-2xl p-4 text-center cursor-pointer transition-colors relative" onClick={() => uploadProgressId === null && simulateUpload("ID")}>
                  {uploadProgressId === null ? (
                    <div className="space-y-1.5">
                      <UploadCloud className="h-6 w-6 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">Pièce d'identité (CNI / Passeport)</p>
                      <p className="text-[10px] text-slate-400">Cliquez pour simuler le scan du document</p>
                    </div>
                  ) : uploadProgressId < 100 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>Téléversement en cours...</span>
                        <span>{uploadProgressId}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#1864FF] h-full transition-all duration-200" style={{ width: `${uploadProgressId}%` }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs font-bold text-green-600">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>cni_recto_verso.png</span>
                      </div>
                      <span className="text-[10px] bg-green-50 px-2 py-0.5 rounded">Reçu</span>
                    </div>
                  )}
                </div>

                {/* Selfie upload box */}
                <div className="border border-dashed border-slate-200 hover:border-[#1864FF] rounded-2xl p-4 text-center cursor-pointer transition-colors relative" onClick={() => uploadProgressSelfie === null && simulateUpload("SELFIE")}>
                  {uploadProgressSelfie === null ? (
                    <div className="space-y-1.5">
                      <User className="h-6 w-6 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">Selfie avec votre pièce</p>
                      <p className="text-[10px] text-slate-400">Cliquez pour simuler le selfie photo</p>
                    </div>
                  ) : uploadProgressSelfie < 100 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>Téléversement en cours...</span>
                        <span>{uploadProgressSelfie}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#1864FF] h-full transition-all duration-200" style={{ width: `${uploadProgressSelfie}%` }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs font-bold text-green-600">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>selfie_validation.png</span>
                      </div>
                      <span className="text-[10px] bg-green-50 px-2 py-0.5 rounded">Reçu</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={kycValidating || uploadProgressId !== 100 || uploadProgressSelfie !== 100}
                className="w-full bg-slate-900 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all cursor-pointer mt-4"
              >
                {kycValidating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-[#1864FF]" />
                    <span>Vérification IA Sandbox...</span>
                  </>
                ) : (
                  <>
                    <span>Soumettre mon dossier KYC</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* KYC SUCCESS INTERMEDIARY SCREEN */}
          {step === 2 && kycSuccess && (
            <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95">
              <div className="h-16 w-16 bg-green-50 text-green-500 border border-green-150 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Dossier KYC Approuvé</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                La Sandbox FPay a vérifié vos documents. Votre identité numérique est désormais validée.
              </p>
              <div className="text-[10px] text-green-600 font-bold bg-green-50 inline-block px-3 py-1 rounded-full">
                Statut : Vérifié (Niveau 2)
              </div>
            </div>
          )}

          {/* STEP 3: WALLET CREATION */}
          {step === 3 && (
            <div className="space-y-6">
              {!createdWallet ? (
                <div className="space-y-5">
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800">
                    <Shield className="h-5 w-5 shrink-0 text-amber-600" />
                    <div className="text-left">
                      <p className="text-xs font-bold">Sécurité Non-Custodiale</p>
                      <p className="text-[10px] text-amber-700/80 leading-relaxed mt-0.5">
                        FPay ne stocke jamais vos clés sur un serveur central. Vos clés Ed25519 sont chiffrées localement dans votre navigateur à l'aide de votre code PIN. Si vous oubliez votre code PIN, vos clés ne pourront pas être déchiffrées.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Définir un code PIN (6 chiffres)</label>
                      <input
                        type="password"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={pin}
                        onChange={e => setPin(e.target.value.replace(/\D/g, "").substring(0, 6))}
                        placeholder="••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-[1em] focus:border-[#1864FF] focus:bg-white outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">Confirmer le code PIN</label>
                      <input
                        type="password"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value.replace(/\D/g, "").substring(0, 6))}
                        placeholder="••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-[1em] focus:border-[#1864FF] focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleWalletGeneration}
                    disabled={isGenerating || pin.length !== 6 || confirmPin.length !== 6}
                    className="w-full bg-[#1864FF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Génération cryptographique...</span>
                      </>
                    ) : (
                      <>
                        <span>Générer mes clés Ed25519</span>
                        <Key className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {/* Console logs simulation */}
                  {generationLogs.length > 0 && (
                    <div className="bg-slate-950 text-slate-400 font-mono text-[10px] rounded-2xl p-4 h-40 overflow-y-auto space-y-1 text-left">
                      {generationLogs.map((log, idx) => (
                        <p key={idx} className={log.includes("générée") || log.includes("prêt") ? "text-green-400" : "text-slate-400"}>
                          {log}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 text-center animate-in fade-in zoom-in-95">
                  <div className="h-16 w-16 bg-blue-50 text-[#1864FF] border border-blue-150 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Wallet généré avec succès !</h3>
                    <p className="text-xs text-slate-500 mt-1">Vos clés cryptographiques Ed25519 locales sont prêtes.</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clé Publique Ed25519 (Adresse publique)</p>
                      <p className="text-xs font-mono text-slate-800 break-all select-all select-none p-2 bg-white border border-slate-100 rounded-lg mt-1">
                        {createdWallet.publicKey}
                      </p>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Graine de clé privée (Chiffrée sur l'appareil)</p>
                      <p className="text-xs font-mono text-slate-400 p-2 bg-white border border-slate-100 rounded-lg mt-1 select-none flex items-center gap-2">
                        <Lock className="h-3 w-3" />
                        <span>••••••••••••••••••••••••••••••••••••</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleFinishOnboarding}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span>Accéder à mon Wallet</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
