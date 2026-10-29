
'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { 
  DollarSign, 
  Zap,
  ShieldCheck,
  UserCircle,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const db = useFirestore();
  const router = useRouter();
  const [stats, setStats] = useState({
    users: 0,
    managers: 0,
    influencers: 0,
    revenue: 0
  });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;

    // Estatísticas de Usuários
    const unsubUsers = onSnapshot(collection(db, 'users'), snap => {
      const mgrs = snap.docs.filter(d => d.data().role === 'manager').length;
      setStats(prev => ({ ...prev, users: snap.size, managers: mgrs }));
    });

    // Estatísticas de Influenciadores
    const unsubInf = onSnapshot(collection(db, 'influencers'), snap => {
      setStats(prev => ({ ...prev, influencers: snap.size }));
    });

    // Logs de Auditoria (usando a coleção 'logs' que você já tem)
    const logsQ = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(10));
    const unsubLogs = onSnapshot(logsQ, snap => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setLogs(list);
    }, (err) => {
      console.log("Aguardando logs...");
    });

    return () => {
      unsubUsers();
      unsubInf();
      unsubLogs();
    };
  }, [db]);

  const cards = [
    { label: 'Faturamento Bruto', value: 'R$ 0,00', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Base de Jogadores', value: stats.users, icon: Users, color: 'text-cyan-400' },
    { label: 'Gerentes Ativos', value: stats.managers, icon: ShieldCheck, color: 'text-amber-400' },
    { label: 'Tropa de Influencers', value: stats.influencers, icon: UserCircle, color: 'text-purple-400' },
  ];

  return (
    <div className="p-8 md:p-12 space-y-10" id="admin-page">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Painel de Operações</h2>
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest mt-1">Visão Master da Plataforma BlockCash</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Sistema Ativo
        </div>
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
          <div className="rounded-[2.5rem] bg-[#111622] border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Auditoria Master</h3>
              <Button onClick={() => router.push('/admin/logs')} variant="ghost" className="text-[10px] font-black uppercase text-cyan-400">Ver Tudo</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/20 text-[10px] font-black uppercase text-white/30 tracking-widest">
                    <th className="px-8 py-5">Horário</th>
                    <th className="px-8 py-5">Ação</th>
                    <th className="px-8 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.length === 0 ? (
                    <tr><td colSpan={3} className="px-8 py-10 text-center text-white/10 font-black uppercase text-[10px] italic">Sem atividade recente</td></tr>
                  ) : logs.map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-5 text-[10px] font-bold text-white/40">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '---'}</td>
                      <td className="px-8 py-5 text-xs font-bold text-white uppercase tracking-tight">{log.action || log.details}</td>
                      <td className="px-8 py-5 text-right"><span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase">Gravado</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <Card className="bg-gradient-to-br from-[#111622] to-[#0d111c] border-white/5 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white italic">Motor Arena</h3>
                <p className="text-[10px] text-white/30 font-bold uppercase">Configuração</p>
              </div>
            </div>
            <div className="space-y-3">
              <Button onClick={() => router.push('/admin/configuracoes')} className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-black font-black uppercase tracking-widest text-xs rounded-2xl">
                Ajustar Dificuldade
              </Button>
              <Button onClick={() => router.push('/admin/managers')} className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl">
                Contratar Gerente
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
