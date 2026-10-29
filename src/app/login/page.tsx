'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });

  const auth = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    const currentErrors = { email: '', password: '', general: '' };
    let hasError = false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      currentErrors.email = 'E-mail inválido.';
      hasError = true;
    }

    if (password.length < 6) {
      currentErrors.password = 'Mínimo 6 caracteres.';
      hasError = true;
    }

    if (hasError) {
      setErrors(currentErrors);
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/painel');
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErrors(prev => ({ ...prev, general: 'E-mail ou senha incorretos.' }));
      } else {
        setErrors(prev => ({ ...prev, general: 'Erro ao fazer login. Tente novamente.' }));
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
              Acesse sua conta
            </h1>
            <p className="text-white/50 text-[11px] font-medium leading-relaxed">
              Insira suas credenciais para entrar no painel e jogar.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input 
                required
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors(prev => ({ ...prev, email: '' }));
                }}
                placeholder="E-mail" 
                className="h-12 bg-[#060a17] border-white/5 rounded-2xl px-5 text-sm placeholder:text-white/20"
              />
              {errors.email && <p className="text-[10px] text-red-400 mt-1 pl-2 font-bold uppercase">{errors.email}</p>}
            </div>

            <div className="relative">
              <Input 
                required
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors(prev => ({ ...prev, password: '' }));
                }}
                placeholder="Senha" 
                className="h-12 bg-[#060a17] border-white/5 rounded-2xl px-5 pr-12 text-sm placeholder:text-white/20"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.password && <p className="text-[10px] text-red-400 mt-1 pl-2 font-bold uppercase">{errors.password}</p>}
            </div>

            {errors.general && <p className="text-xs text-red-400 text-center font-bold bg-red-400/10 p-2 rounded-xl border border-red-400/20">{errors.general}</p>}

            <Button disabled={loading} className="w-full h-12 bg-gradient-to-r from-[#7b61ff] to-[#5a42d8] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_10px_30px_rgba(123,97,255,0.3)] mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ENTRAR NA CONTA'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-[11px] font-bold">
              Não tem uma conta? <Link href="/register" className="text-cyan-400 font-black">CADASTRE-SE</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
