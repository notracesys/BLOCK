
'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

function RegisterForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    general: ''
  });

  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetValue = e.target.value;
    const clean = targetValue.replace(/\D/g, '');
    
    let formatted = clean;
    if (clean.length > 0) {
      if (clean.length <= 2) {
        formatted = `(${clean}`;
      } else if (clean.length <= 6) {
        formatted = `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
      } else if (clean.length <= 10) {
        formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
      } else {
        formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
      }
    }
    setPhone(formatted);
    setErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    const currentErrors = { fullName: '', email: '', phone: '', password: '', confirmPassword: '', general: '' };
    let hasError = false;

    const nameTrimmed = fullName.trim();
    const nameParts = nameTrimmed.split(/\s+/);
    if (nameParts.length < 2) {
      currentErrors.fullName = 'Insira nome e sobrenome.';
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      currentErrors.email = 'E-mail inválido.';
      hasError = true;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      currentErrors.phone = 'Telefone inválido.';
      hasError = true;
    }

    if (password.length < 6) {
      currentErrors.password = 'Mínimo 6 caracteres.';
      hasError = true;
    }

    if (password !== confirmPassword) {
      currentErrors.confirmPassword = 'Senhas não coincidem.';
      hasError = true;
    }

    if (hasError) {
      setErrors(currentErrors);
      return;
    }

    setLoading(true);
    try {
      // 1. Criar Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Gerar Referral Code próprio (curto e elegante)
      const personalReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // 3. Buscar Padrinho (Referrer) se houver código na URL
      let referredByUID = null;
      if (refCode) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', refCode.toUpperCase()));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const referrerDoc = querySnapshot.docs[0];
          referredByUID = referrerDoc.id;
          
          // Incrementa contador do padrinho
          updateDoc(referrerDoc.ref, {
            referredCount: increment(1)
          }).catch(() => {});
        }
      }

      // 4. Salvar Perfil
      const userRef = doc(db, 'users', user.uid);
      const userData = {
        fullName: nameTrimmed,
        phone: cleanPhone,
        email: email.toLowerCase(),
        balance: 0,
        gamesPlayed: 0,
        totalRedeems: 0,
        totalWinnings: 0,
        maxRedeem: 0,
        commissionBalance: 0,
        totalCommissionEarned: 0,
        referredCount: 0,
        referredDepositVolume: 0,
        referredBy: referredByUID,
        referralCode: personalReferralCode,
        createdAt: new Date().toISOString(),
      };

      await setDoc(userRef, userData);
      router.push('/painel');

    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/email-already-in-use') {
        setErrors(prev => ({ ...prev, email: 'E-mail já cadastrado.' }));
      } else {
        setErrors(prev => ({ ...prev, general: error.message }));
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#060a17] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
      
      <main className="w-full max-w-[400px] z-10 flex flex-col items-center">
        <div className="mb-6 relative animate-float">
          <Image 
            src="/blockcash.png" 
            alt="Block Cash Logo" 
            width={110} 
            height={40} 
            className="object-contain filter drop-shadow-[0_0_15px_rgba(123,97,255,0.4)]"
            priority
          />
        </div>

        <div className="w-full bg-[#0b1426] border border-white/5 rounded-[2rem] p-7 shadow-2xl relative overflow-hidden">
          <div className="mb-6">
            <h1 className="text-xl font-[900] text-white tracking-tight leading-none mb-2 uppercase">
              Crie sua conta
            </h1>
            <p className="text-white/50 text-[11px] font-medium leading-relaxed">
              Use dados reais para garantir seus resgates via PIX.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Input 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nome e Sobrenome" 
                className="h-12 bg-[#060a17] border-white/5 rounded-2xl px-5 text-sm placeholder:text-white/20"
              />
              {errors.fullName && <p className="text-[10px] text-red-400 mt-1 pl-2 font-bold uppercase">{errors.fullName}</p>}
            </div>

            <div>
              <Input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail" 
                className="h-12 bg-[#060a17] border-white/5 rounded-2xl px-5 text-sm placeholder:text-white/20"
              />
              {errors.email && <p className="text-[10px] text-red-400 mt-1 pl-2 font-bold uppercase">{errors.email}</p>}
            </div>

            <div>
              <Input 
                required
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Telefone: (DD) 99999-9999" 
                className="h-12 bg-[#060a17] border-white/5 rounded-2xl px-5 text-sm placeholder:text-white/20"
              />
              {errors.phone && <p className="text-[10px] text-red-400 mt-1 pl-2 font-bold uppercase">{errors.phone}</p>}
            </div>

            <div className="relative">
              <Input 
                required
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha (mín. 6 dígitos)" 
                className="h-12 bg-[#060a17] border-white/5 rounded-2xl px-5 pr-12 text-sm placeholder:text-white/20"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.password && <p className="text-[10px] text-red-400 mt-1 pl-2 font-bold uppercase">{errors.password}</p>}
            </div>

            <div className="relative">
              <Input 
                required
                type={showConfirmPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar Senha" 
                className="h-12 bg-[#060a17] border-white/5 rounded-2xl px-5 pr-12 text-sm placeholder:text-white/20"
              />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.confirmPassword && <p className="text-[10px] text-red-400 mt-1 pl-2 font-bold uppercase">{errors.confirmPassword}</p>}
            </div>

            {errors.general && <p className="text-xs text-red-400 text-center font-bold bg-red-400/10 p-2 rounded-xl border border-red-400/20">{errors.general}</p>}

            <Button disabled={loading} className="w-full h-12 bg-gradient-to-r from-[#7b61ff] to-[#5a42d8] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_10px_30px_rgba(123,97,255,0.3)] mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'FINALIZAR CADASTRO'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-[11px] font-bold">
              Já tem conta? <Link href="/" className="text-cyan-400 font-black">ENTRAR</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
