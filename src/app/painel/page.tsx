
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, updateDoc, onSnapshot, increment, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { 
  Wallet, 
  Users, 
  User, 
  Gamepad2, 
  ArrowUpRight, 
  X, 
  Ticket, 
  AlertTriangle, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Key, 
  LogOut,
  ShieldCheck,
  Fingerprint
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import Image from 'next/image';

export default function PainelPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [userData, setUserData] = useState<any>(null);
  const [selectedValue, setSelectedValue] = useState<number>(10);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [showAffiliateModal, setShowAffiliateModal] = useState<boolean>(false);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  
  const [depositAmount, setDepositAmount] = useState<string>('20');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('30');
  const [pixKey, setPixKey] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [onlinePlayers, setOnlinePlayers] = useState<number>(803);
  const [linkCopied, setLinkCopied] = useState(false);
  const [referralLink, setReferralLink] = useState<string>('');

  const [showTransactions, setShowTransactions] = useState(false);
  const [showPassChange, setShowPassChange] = useState(false);

  const presets = [5, 10, 20, 30, 50, 100];

  const depositPresets = [
    { val: 20, tag: 'MÍNIMO', color: 'bg-[#00f19a] text-slate-950' },
    { val: 30, tag: 'BOM', color: 'bg-amber-500 text-slate-950' },
    { val: 40, tag: 'ÓTIMO', color: 'bg-orange-500 text-white' },
    { val: 50, tag: 'EXCELENTE', color: 'bg-rose-500 text-white' },
    { val: 100, tag: 'SUPER', color: 'bg-purple-500 text-white' },
    { val: 200, tag: 'MÁXIMO', color: 'bg-fuchsia-500 text-white' },
  ];

  useEffect(() => {
    if (userData?.referralCode && typeof window !== 'undefined') {
      setReferralLink(`${window.location.origin}/register?ref=${userData.referralCode}`);
    }
  }, [userData]);

  useEffect(() => {
    setOnlinePlayers(Math.floor(Math.random() * (1500 - 500 + 1)) + 500);
    const interval = setInterval(() => {
      setOnlinePlayers((current) => {
        const change = Math.floor(Math.random() * 61) - 30;
        let nextValue = current + change;
        if (nextValue < 500) nextValue = 500 + Math.floor(Math.random() * 20);
        if (nextValue > 1500) nextValue = 1500 - Math.floor(Math.random() * 20);
        return nextValue;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/register');
      return;
    }
    if (!db) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    }, (error) => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'get',
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });

    return () => unsubscribe();
  }, [user, authLoading, db, router]);

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    toast({ title: "Link Copiado!", description: "Seu link de indicação foi copiado com sucesso." });
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const handleAddBalance = () => {
    if (!user || !db || !userData) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 20) {
      toast({ variant: "destructive", title: "Valor insuficiente", description: "O valor mínimo para depósito é de R$ 20,00." });
      return;
    }
    setIsDepositing(true);
    const userRef = doc(db, 'users', user.uid);
    const settingsRef = doc(db, 'settings', 'game');

    updateDoc(userRef, { balance: increment(amount) })
      .then(() => {
        updateDoc(settingsRef, { totalDeposited: increment(amount) }).catch(() => {});
        if (userData.referredBy) {
          const referrerRef = doc(db, 'users', userData.referredBy);
          const commission = amount * 0.5;
          updateDoc(referrerRef, {
            commissionBalance: increment(commission),
            totalCommissionEarned: increment(commission),
            referredDepositVolume: increment(amount)
          }).catch(() => {});
        }
        toast({ title: "Saldo Adicionado!", description: `R$ ${amount.toFixed(2)} creditados com sucesso.` });
        setShowDepositModal(false);
        setIsDepositing(false);
      })
      .catch(async (error) => {
        setIsDepositing(false);
        const permissionError = new FirestorePermissionError({ path: userRef.path, operation: 'update', requestResourceData: { balance: 'increment_deposit' } } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleRequestWithdraw = () => {
    if (!user || !db || !userData) return;
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 5) {
      toast({ variant: "destructive", title: "Valor inválido", description: "O valor mínimo para saque é de R$ 5,00." });
      return;
    }
    if ((userData.balance || 0) < amount) {
      toast({ variant: "destructive", title: "Saldo insuficiente", description: "Você não possui saldo suficiente para este saque." });
      return;
    }
    if (!pixKey || !cpf) {
      toast({ variant: "destructive", title: "Campos obrigatórios", description: "Preencha a chave PIX e o CPF para continuar." });
      return;
    }
    setIsWithdrawing(true);
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, { balance: increment(-amount) })
      .then(() => {
        toast({ title: "Solicitação enviada!", description: `Seu saque de R$ ${amount.toFixed(2)} foi enviado para análise política e de segurança.` });
        setShowWithdrawModal(false);
        setIsWithdrawing(false);
      })
      .catch(async (error) => {
        setIsWithdrawing(false);
        const permissionError = new FirestorePermissionError({ path: userRef.path, operation: 'update', requestResourceData: { balance: 'decrement_withdraw' } } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleStartGame = () => {
    if (!userData || !user || !db) return;
    if ((userData.balance || 0) < selectedValue) {
      setShowInsufficientBalanceModal(true);
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, { balance: increment(-selectedValue), gamesPlayed: increment(1) })
      .then(() => { router.push(`/game?entry=${selectedValue}`); })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({ path: userRef.path, operation: 'update', requestResourceData: { balance: 'decrement_start_game' } } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleLogout = () => { if (auth) auth.signOut().then(() => router.push('/')); };

  if (authLoading || !userData) {
    return (
      <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center p-4 text-white">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/40">Carregando...</p>
      </div>
    );
  }

  const potentialWin = selectedValue * 5;
  const numWithdrawAmount = parseFloat(withdrawAmount) || 0;
  const netWithdrawAmount = Math.max(0, numWithdrawAmount - 3);
  const isWithdrawInsufficient = (userData.balance || 0) < numWithdrawAmount;

  return (
    <div className="min-h-screen w-full bg-[#08090d] text-white flex flex-col justify-between relative overflow-hidden pb-24">
      <div className="w-full flex flex-col p-4 flex-1">
        <header className="w-full flex items-center justify-between h-14 px-1 mb-4 z-10 shrink-0">
          <div className="flex items-center">
            <Image src="/blockcash.png" alt="Block Cash Logo" width={75} height={30} className="object-contain filter drop-shadow-[0_2px_8px_rgba(38,217,255,0.3)]" priority />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">SALDO</span>
              <span className="text-sm font-black text-[#35f59a]">R$ {(userData.balance || 0).toFixed(2).replace('.', ',')}</span>
            </div>
            <button onClick={() => setShowProfileModal(true)} className="relative w-8 h-8 rounded-full bg-[#7b61ff] flex items-center justify-center font-black text-xs text-white border border-white/10">
              {userData.fullName?.substring(0,1).toUpperCase() || 'U'}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#35f59a] flex items-center justify-center text-slate-950 font-extrabold text-[10px]">+</div>
            </button>
          </div>
        </header>

        <nav className="fixed bottom-0 max-w-[480px] w-full mx-auto left-0 right-0 z-40 bg-[#0c0f17]/90 backdrop-blur-md border-t border-white/5 h-20 px-2 flex items-center justify-around shadow-xl">
          <button onClick={() => setShowDepositModal(true)} className="flex flex-col items-center justify-center flex-1 gap-1 text-white/40 hover:text-white transition-colors">
            <Wallet className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-wider">Depositar</span>
          </button>
          <button onClick={() => setShowWithdrawModal(true)} className="flex flex-col items-center justify-center flex-1 gap-1 text-white/40 hover:text-white transition-colors">
            <ArrowUpRight className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-wider">Sacar</span>
          </button>
          <div className="flex flex-col items-center justify-center flex-1 -translate-y-2">
            <div onClick={handleStartGame} className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#35f59a] to-[#26d9ff] flex items-center justify-center shadow-[0_0_15px_rgba(38,217,255,0.45)] cursor-pointer">
              <Gamepad2 className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-[9px] font-black text-[#35f59a] uppercase tracking-wider mt-1.5">Jogar</span>
          </div>
          <button onClick={() => setShowAffiliateModal(true)} className="flex flex-col items-center justify-center flex-1 gap-1 text-white/40 hover:text-white transition-colors">
            <Users className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-wider">Indicar</span>
          </button>
          <button onClick={() => setShowProfileModal(true)} className="flex flex-col items-center justify-center flex-1 gap-1 text-white/40 hover:text-white transition-colors">
            <User className="w-4 h-4" /><span className="text-[9px] font-bold uppercase tracking-wider">Perfil</span>
          </button>
        </nav>

        <main className="w-full max-w-[400px] mx-auto z-10 flex-1 flex flex-col justify-center">
          <div className="w-full bg-[#0d111c]/90 border border-white/5 rounded-[2rem] p-4 shadow-2xl space-y-4">
            <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-white/10">
              <Image src="/hero.webp" alt="Encaixe os blocks e ganhe" fill className="object-cover" priority />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#35f59a] rounded-full pulse-dot"></span>
                <span className="text-[9px] font-black text-white/90 uppercase tracking-wider">{onlinePlayers} online</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-white/40 tracking-widest pl-0.5">VALOR DE ENTRADA</label>
              <div className="grid grid-cols-3 gap-2">
                {presets.map((val) => (
                  <button key={val} onClick={() => setSelectedValue(val)} className={`h-10 rounded-xl font-black text-xs transition-all border ${selectedValue === val ? 'bg-[#e2f5ff] text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(38,217,255,0.25)]' : 'bg-[#131926] text-white/70 border-white/5'}`}>R${val}</button>
                ))}
              </div>
            </div>
            <div className="relative bg-[#131926] rounded-xl border border-white/5 h-12 flex items-center px-4">
              <span className="text-white/40 text-xs font-bold mr-2">R$</span>
              <Input type="number" value={selectedValue} onChange={(e) => { const val = parseFloat(e.target.value); if (!isNaN(val)) setSelectedValue(val); }} className="bg-transparent border-0 h-full p-0 text-white font-black text-sm focus-visible:ring-0 focus-visible:ring-offset-0" />
            </div>
            <div className="w-full bg-[#131926]/40 rounded-xl border border-white/5 py-3 text-center">
              <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest block mb-0.5">Prêmio Máximo (5 Meta)</span>
              <strong className="text-lg font-black text-[#ffbd1c]">R$ {potentialWin.toFixed(2).replace('.', ',')}</strong>
            </div>
            <button onClick={handleStartGame} className="w-full h-12 rounded-2xl bg-[#35f59a] text-slate-950 font-black text-sm shadow-[0_4px_15px_rgba(53,245,154,0.3)] uppercase tracking-wide transition-all active:scale-[0.98]">Iniciar Arena Real</button>
          </div>
        </main>
      </div>

      {/* MODAL DE PERFIL */}
      <div className={`fixed inset-0 ${showProfileModal ? 'flex' : 'hidden'} items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[8000]`}>
        <div className="w-full max-w-[400px] border border-white/5 rounded-[2.5rem] bg-[#0c0f17] shadow-2xl overflow-hidden flex flex-col relative pb-6 animate-in fade-in zoom-in duration-300 max-h-[92vh]">
          <div className="flex items-center justify-between p-6 pb-2">
            <h2 className="text-2xl font-[1000] text-white uppercase tracking-tight">Perfil</h2>
            <button onClick={() => setShowProfileModal(false)} className="w-8 h-8 rounded-full bg-[#e73b29] flex items-center justify-center text-white shadow-lg z-30 transition-transform active:scale-90">
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 space-y-4 pt-2 pb-4 scrollbar-hide">
            <div className="bg-slate-900/60 rounded-[2rem] p-5 border border-white/5 flex flex-col space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#4f46e5] flex items-center justify-center text-white text-xl font-black shadow-lg">{userData.fullName?.substring(0,1).toUpperCase()}</div>
                <div className="flex flex-col">
                  <strong className="text-white text-lg font-black">{userData.fullName?.toLowerCase()}</strong>
                  <span className="text-white/40 text-xs font-medium">({userData.phone?.substring(0,2)}) {userData.phone?.substring(2,7)}-{userData.phone?.substring(7)}</span>
                </div>
              </div>
              
              {userData.isAdmin && (
                <button onClick={() => router.push('/admin')} className="w-full h-11 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <ShieldCheck className="w-4 h-4" /> PAINEL ADMIN MASTER
                </button>
              )}

              {/* UID Info para ajuda no Firebase */}
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Seu ID no Banco (UID)</span>
                  <code className="text-[10px] text-white/60 font-mono select-all">{user?.uid}</code>
                </div>
              </div>

              <div className="relative bg-slate-950/80 rounded-2xl border border-white/5 h-12 flex items-center px-4 justify-between">
                <span className="text-white/20 text-[10px] truncate max-w-[140px] font-mono">{referralLink}</span>
                <button onClick={handleCopyLink} className="bg-slate-800/80 text-white font-black text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 active:scale-95 transition-transform">
                  {linkCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copiar link
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/40 rounded-[1.5rem] p-5 border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
                <strong className="text-2xl font-black text-white">{userData.gamesPlayed || 0}</strong>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Partidas</span>
              </div>
              <div className="bg-slate-900/40 rounded-[1.5rem] p-5 border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
                <strong className="text-2xl font-black text-white">{userData.totalRedeems || 0}</strong>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Resgates</span>
              </div>
              <div className="bg-slate-900/40 rounded-[1.5rem] p-5 border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
                <strong className="text-2xl font-black text-emerald-400">R$ {(userData.totalWinnings || 0).toFixed(2).replace('.', ',')}</strong>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total ganho</span>
              </div>
              <div className="bg-slate-900/40 rounded-[1.5rem] p-5 border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
                <strong className="text-2xl font-black text-emerald-400">R$ {(userData.maxRedeem || 0).toFixed(2).replace('.', ',')}</strong>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Maior resgate</span>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden">
                <button onClick={() => setShowTransactions(!showTransactions)} className="w-full p-4 flex items-center justify-between text-left">
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Últimas Transações</span>
                  <div className="flex items-center gap-1.5"><span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{showTransactions ? 'Ocultar' : 'Ver'}</span>{showTransactions ? <ChevronUp className="w-3.5 h-3.5 text-white/30" /> : <ChevronDown className="w-3.5 h-3.5 text-white/30" />}</div>
                </button>
                {showTransactions && (<div className="px-4 pb-5 pt-1 text-center"><p className="text-white/20 text-[11px] font-medium italic">Nenhum depósito ou saque ainda.</p></div>)}
              </div>
              <div className="bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden">
                <button onClick={() => setShowPassChange(!showPassChange)} className="w-full p-4 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2"><Key className="w-3.5 h-3.5 text-white/40" /><span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Alterar Senha</span></div>
                  {showPassChange ? <ChevronUp className="w-3.5 h-3.5 text-white/30" /> : <ChevronDown className="w-3.5 h-3.5 text-white/30" />}
                </button>
                {showPassChange && (<div className="px-4 pb-5 pt-2 space-y-3"><Input placeholder="Senha atual" type="password" className="h-10 bg-black/40 border-white/5 text-xs rounded-xl" /><Input placeholder="Nova senha" type="password" className="h-10 bg-black/40 border-white/5 text-xs rounded-xl" /><button className="w-full h-10 rounded-xl bg-white/5 text-white font-black text-[10px] uppercase tracking-widest">Salvar Nova Senha</button></div>)}
              </div>
            </div>
            <button onClick={handleLogout} className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#5a1215] to-[#2e0809] border border-white/5 flex items-center justify-center gap-2 text-rose-500 font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] mt-2"><LogOut className="w-4 h-4" /> Finalizar sessão</button>
          </div>
        </div>
      </div>

      {/* MODAL DE INDICAÇÕES */}
      <div className={`fixed inset-0 ${showAffiliateModal ? 'flex' : 'hidden'} items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[7000]`}>
        <div className="w-full max-w-[390px] border border-white/5 rounded-[2.5rem] bg-[#0c0f17] shadow-2xl overflow-hidden flex flex-col relative pb-6 animate-in fade-in zoom-in duration-300">
          <div className="relative w-full aspect-[2.7/1] bg-slate-900/50">
            <Image src="/indicar.webp" alt="Indique e Ganhe" fill className="object-cover" priority data-ai-hint="affiliate marketing banner" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-transparent to-transparent"></div>
            <button onClick={() => setShowAffiliateModal(false)} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#e73b29] flex items-center justify-center text-white shadow-lg z-30 transition-transform active:scale-90"><X className="w-4 h-4 stroke-[3]" /></button>
          </div>
          <div className="p-5 flex flex-col space-y-5">
            <div className="bg-[#35f59a] rounded-[2rem] p-5 flex flex-col space-y-4 shadow-[0_8px_25px_rgba(53,245,154,0.2)]">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-900/60 uppercase tracking-widest">Saldo de Comissões</span>
                  <strong className="text-2xl font-[1000] text-slate-950">R$ {(userData.commissionBalance || 0).toFixed(2).replace('.', ',')}</strong>
                  <span className="text-[9px] font-bold text-slate-900/50 uppercase mt-0.5">Total recebido: R$ {(userData.totalCommissionEarned || 0).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              <button className="w-full h-11 rounded-2xl bg-slate-950/10 border border-slate-950/10 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"><ArrowUpRight className="w-4 h-4" /> Sacar Comissões</button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.2em] pl-1">Seu Link Exclusivo (50% Comissões)</label>
              <div className="relative bg-slate-950/60 rounded-2xl border border-white/5 h-12 flex items-center px-4 overflow-hidden"><span className="text-white/20 text-[10px] truncate max-w-[240px] font-mono">{referralLink}</span></div>
              <button onClick={handleCopyLink} className="w-full h-11 rounded-2xl bg-[#35f59a] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg">{linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{linkCopied ? 'Copiado!' : 'Copiar Link'}</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/60 rounded-[1.5rem] p-4 border border-white/5 flex flex-col items-center text-center space-y-1"><span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Qtd de Indicados</span><strong className="text-2xl font-black text-white pt-1">{userData.referredCount || 0}</strong></div>
              <div className="bg-slate-900/60 rounded-[1.5rem] p-4 border border-white/5 flex flex-col items-center text-center space-y-1"><span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Volume Depositado</span><strong className="text-2xl font-black text-amber-400 pt-1">R$ {(userData.referredDepositVolume || 0).toFixed(2).replace('.', ',')}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE SALDO INSUFICIENTE */}
      <div className={`fixed inset-0 ${showInsufficientBalanceModal ? 'flex' : 'hidden'} items-center justify-center p-6 bg-black/60 backdrop-blur-sm z-[8000]`}>
        <div className="w-full max-w-[340px] border border-white/10 rounded-[2.5rem] bg-[#1a1d29] p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20"><AlertTriangle className="w-8 h-8" /></div>
          <div className="space-y-2"><h3 className="text-xl font-[1000] uppercase tracking-tighter text-white">Saldo Insuficiente</h3><p className="text-white/40 text-[11px] font-bold leading-relaxed px-4">Você precisa de saldo para entrar nesta partida.</p></div>
          <div className="bg-black/40 rounded-[1.5rem] p-5 border border-white/5 space-y-4 text-left">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest"><span className="text-white/30">Seu Saldo:</span><span className="text-[#ff4b72] text-sm">R$ {(userData.balance || 0).toFixed(2).replace('.', ',')}</span></div>
            <div className="h-px bg-white/5 w-full" />
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest"><span className="text-white/30">Custo de Entrada:</span><span className="text-[#26d9ff] text-sm">R$ {selectedValue.toFixed(2).replace('.', ',')}</span></div>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button onClick={() => { setShowInsufficientBalanceModal(false); setShowDepositModal(true); }} className="w-full h-14 rounded-2xl bg-[#35f59a] text-slate-950 font-[1000] text-sm uppercase tracking-wider shadow-[0_8px_20px_rgba(53,245,154,0.3)] transition-all active:scale-95">Fazer Depósito</button>
            <button onClick={() => setShowInsufficientBalanceModal(false)} className="w-full h-14 rounded-2xl bg-white/5 text-white/40 font-[1000] text-sm uppercase tracking-wider transition-all hover:text-white active:scale-95">Voltar</button>
          </div>
        </div>
      </div>

      {/* MODAL DE DEPÓSITO */}
      <div className={`fixed inset-0 ${showDepositModal ? 'flex' : 'hidden'} items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[5000]`}>
        <div className="w-full max-w-[380px] border border-white/5 rounded-[2.5rem] bg-[#111622] shadow-2xl overflow-hidden flex flex-col relative">
          <div className="relative w-full aspect-[2.7/1] bg-slate-950/20"><Image src="/card1.webp" alt="Banner de Depósito" fill className="object-cover" priority /><button onClick={() => setShowDepositModal(false)} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#e73b29] flex items-center justify-center text-white shadow-md z-30 transition-transform active:scale-90"><X className="w-3.5 h-3.5 stroke-[3]" /></button></div>
          <div className="p-5 flex flex-col space-y-4">
            <div><label className="text-[11px] font-black uppercase text-white/40 tracking-wider block mb-3">VALOR RÁPIDO (MÍNIMO R$ 20)</label>
              <div className="grid grid-cols-3 gap-x-2 gap-y-5 pt-2">
                {depositPresets.map((item) => (
                  <button key={item.val} type="button" onClick={() => setDepositAmount(String(item.val))} className={`h-12 rounded-xl font-black text-sm relative transition-all border ${depositAmount === String(item.val) ? 'bg-[#182030] text-white border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]' : 'bg-[#182030] text-white border-transparent'}`}><span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-wide leading-none ${item.color}`}>{item.tag}</span>R${item.val}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5"><label className="text-[9px] font-bold text-white/30 uppercase tracking-widest pl-1">DIGITE O VALOR (MÍNIMO R$ 20,00)</label><div className="relative bg-[#182030] rounded-xl border border-white/5 h-12 flex items-center px-4"><span className="text-white/40 text-xs font-bold mr-2">R$</span><Input type="number" min="20" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="bg-transparent border-0 h-full p-0 text-white font-black text-sm focus-visible:ring-0 focus-visible:ring-offset-0" /></div></div>
            <button type="button" className="flex items-center gap-1.5 text-[#ff4b72] text-[11px] font-bold uppercase tracking-wider self-start pl-1 py-1 hover:opacity-80"><Ticket className="w-3.5 h-3.5 fill-current" />Tenho um cupom</button>
            <button onClick={handleAddBalance} disabled={isDepositing} className="w-full h-12 rounded-2xl bg-[#00e26f] text-slate-950 font-black text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-[0_4px_15px_rgba(0,226,111,0.25)] flex items-center justify-center">{isDepositing ? 'PROCESSANDO...' : 'Gerar QR Code PIX'}</button>
          </div>
        </div>
      </div>

      {/* MODAL DE SAQUE */}
      <div className={`fixed inset-0 ${showWithdrawModal ? 'flex' : 'hidden'} items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-[5000]`}>
        <div className="w-full max-w-[380px] border border-white/5 rounded-[2.5rem] bg-[#111622] shadow-2xl overflow-hidden flex flex-col relative pb-4">
          <div className="relative w-full aspect-[2.7/1] bg-slate-950/20"><Image src="/card4.webp" alt="Saque Instantâneo R$" fill className="object-cover" priority /><button onClick={() => setShowWithdrawModal(false)} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#e73b29] flex items-center justify-center text-white shadow-md z-30 transition-transform active:scale-90"><X className="w-3.5 h-3.5 stroke-[3]" /></button></div>
          <div className="p-4 flex flex-col space-y-3.5">
            <div className="bg-[#182030] rounded-2xl p-4 flex items-center gap-4 border border-white/5"><div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-[#35f59a] font-black text-sm shrink-0">R$</div><div className="flex flex-col"><span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">SALDO DISPONÍVEL</span><strong className="text-xl font-black text-white">R$ {(userData.balance || 0).toFixed(2).replace('.', ',')}</strong></div></div>
            <div className="relative bg-[#182030] rounded-xl border border-white/5 h-12 flex items-center px-4"><span className="text-white/40 text-xs font-bold mr-2">R$</span><Input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="bg-transparent border-0 h-full p-0 text-white font-black text-sm focus-visible:ring-0 focus-visible:ring-offset-0" /></div>
            <p className="text-[11px] text-white/60 px-1">Taxa de saque: R$ 3,00. Mínimo R$ 5,00. Você receberá na sua conta bancária: <span className="font-black text-white">R$ {netWithdrawAmount.toFixed(2).replace('.', ',')}</span></p>
            <div className="relative bg-[#182030] rounded-xl border border-white/5 h-12 flex items-center px-4"><span className="text-white/40 text-xs font-black mr-3 uppercase tracking-wider text-cyan-400">PIX</span><Input type="text" value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="Chave PIX (e-mail, telefone ou chave)" className="bg-transparent border-0 h-full p-0 text-white font-medium text-xs placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0" /></div>
            <div className="relative bg-[#182030] rounded-xl border border-white/5 h-12 flex items-center px-4"><span className="text-white/40 text-xs font-black mr-3 uppercase tracking-wider text-cyan-400">CPF</span><Input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="CPF do titular (somente números)" className="bg-transparent border-0 h-full p-0 text-white font-medium text-xs placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0" /></div>
            {isWithdrawInsufficient && (<div className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center"><span className="text-[11px] font-bold text-rose-400">Saldo insuficiente para realizar este saque.</span></div>)}
            <div className="w-full p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-2 items-start text-left"><span className="text-amber-400 text-xs mt-0.5">⚠️</span><p className="text-[10px] font-medium text-amber-400/90 leading-normal">Saques passam por análise de segurança e são processados em até 24h úteis.</p></div>
            <button onClick={handleRequestWithdraw} disabled={isWithdrawing || isWithdrawInsufficient} className="w-full h-12 rounded-2xl bg-[#00e26f] disabled:bg-[#00e26f]/20 disabled:text-slate-950/40 text-slate-950 font-black text-sm uppercase tracking-wider transition-all active:scale-[0.98] shadow-[0_4px_15px_rgba(0,226,111,0.25)] flex items-center justify-center mt-1">{isWithdrawing ? 'PROCESSANDO...' : 'Solicitar Saque'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

