
'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot, query, where, limit } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign,
  ArrowUpRight,
  UserCircle,
  MousePointer2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ManagerDashboard() {
  const db = useFirestore();
  const { user, role } = useUser();
  const [stats, setStats] = useState({
    influencers: 0,
    activeUsers: 0,
    cliques: 0,
    commissions: 0
  });

  useEffect(() => {
    if (!db || !user) return;

    // Filtra tudo pelo ID do gerente logado
    const influencersQ = query(collection(db, 'influencers'), where('managerId', '==', user.uid));
    const unsubInf = onSnapshot(influencersQ, (snap) => {
      let clks = 0;
      snap.forEach(d => clks += (d.data().clicks || 0));
      setStats(prev => ({ ...prev, influencers: snap.size, cliques: clks }));
    });

    const usersQ = query(collection(db, 'users'), where('managerId', '==', user.uid));
    const unsubUsers = onSnapshot(usersQ, (snap) => {
      setStats(prev => ({ ...prev, activeUsers: snap.size }));
    });

    return () => {
      unsubInf();
      unsubUsers();
    };
  }, [db, user]);

  const cards = [
    { label: 'Minhas Comissões', value: `R$ ${stats.commissions.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Minha Tropa', value: stats.influencers, icon: UserCircle, color: 'text-purple-400' },
    { label: 'Usuários na Rede', value: stats.activeUsers, icon: Users, color: 'text-blue-400' },
    { label: 'Cliques Totais', value: stats.cliques, icon: MousePointer2, color: 'text-amber-400' },
  ];

  return (
    <div className="p-8 md:p-12 space-y-10">
      <div>
        <h2 className="text-3xl font-black text-white uppercase italic">Central de Operações</h2>
        <p className="text-white/30 text-sm font-bold uppercase tracking-widest mt-1">Acompanhe o desempenho da sua rede regional.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Card key={i} className="bg-[#111622] border-white/5 p-6 space-y-4 rounded-[2rem] shadow-xl hover:border-white/10 transition-all">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.03]", card.color)}>
              <card.icon size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1">{card.label}</span>
              <div className="text-xl font-black text-white">{card.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-[2.5rem] bg-[#111622] border border-white/5 p-10 h-[400px] flex flex-col justify-center items-center text-center space-y-4">
             <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 mb-4">
                <TrendingUp size={40} />
             </div>
             <h3 className="text-xl font-black text-white uppercase italic">Gráfico de Performance</h3>
             <p className="text-white/20 text-xs font-bold uppercase tracking-widest max-w-xs">As métricas de conversão da sua rede aparecerão aqui conforme os dados forem processados.</p>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <Card className="bg-gradient-to-br from-[#111622] to-[#0d111c] border-white/5 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white italic">Ações Rápidas</h3>
                <p className="text-[10px] text-white/30 font-bold uppercase">Gestão da Operação</p>
              </div>
            </div>
            <div className="space-y-3">
              <Button onClick={() => window.location.href = '/manager/influencers'} className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl">
                Novo Influenciador
              </Button>
              <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl">
                Relatório de Rede
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
