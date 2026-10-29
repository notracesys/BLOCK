
'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { 
  Search, 
  UserX, 
  UserCheck, 
  ShieldAlert, 
  ShieldCheck, 
  Mail,
  Phone,
  Calendar,
  Gamepad2,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function UsersAdmin() {
  const db = useFirestore();
  const { user: authUser } = useUser();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setUsers(list);
      setLoading(false);
    }, () => {
      // Ignora erro pois o layout já valida
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  const toggleUserStatus = async (user: any) => {
    if (!db) return;
    const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
    try {
      await updateDoc(doc(db, 'users', user.id), { status: newStatus });
      toast({ title: "Status Atualizado", description: `Usuário ${user.fullName} está agora ${newStatus === 'active' ? 'Ativo' : 'Bloqueado'}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível alterar o status." });
    }
  };

  const toggleAdminRole = async (user: any) => {
    if (!db || !authUser) return;
    if (user.id === authUser.uid) {
      toast({ variant: "destructive", title: "Ação Bloqueada", description: "Você não pode rebaixar seu próprio acesso master." });
      return;
    }
    const newAdminStatus = !user.isAdmin;
    try {
      await updateDoc(doc(db, 'users', user.id), { isAdmin: newAdminStatus });
      toast({ title: "Cargo Alterado", description: `${user.fullName} agora é ${newAdminStatus ? 'Gerente Master' : 'Jogador'}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao alterar cargo administrativo." });
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
  );

  return (
    <div className="p-8 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Gestão da Base de Dados</h2>
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest mt-1">Monitore, modere e gerencie permissões de acesso.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <Input 
            placeholder="Pesquisar por Nome, E-mail ou Telefone..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="h-12 bg-[#111622] border-white/5 pl-12 rounded-2xl text-sm font-bold"
          />
        </div>
      </div>

      <div className="bg-[#111622] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/20 text-[10px] font-black uppercase text-white/30 tracking-[0.2em]">
                <th className="px-8 py-6">Jogador & Contato</th>
                <th className="px-8 py-6">Financeiro</th>
                <th className="px-8 py-6">Atividade</th>
                <th className="px-8 py-6">Cargo / Status</th>
                <th className="px-8 py-6 text-right">Ações Master</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-cyan-500 mx-auto" size={32} />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-white/20 font-black uppercase text-xs">Nenhum registro encontrado</td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border border-white/5",
                        user.isAdmin ? "bg-amber-500/10 text-amber-500" : "bg-cyan-500/10 text-cyan-400"
                      )}>
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                          {user.fullName}
                          {user.isAdmin && <ShieldCheck size={12} className="text-amber-500" />}
                        </span>
                        <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-white/20">
                          <span className="flex items-center gap-1"><Mail size={10} /> {user.email}</span>
                          <span className="flex items-center gap-1"><Phone size={10} /> {user.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-emerald-400">R$ {user.balance?.toFixed(2)}</span>
                      <span className="text-[10px] font-bold text-white/20 mt-1 uppercase">Ganhos: R$ {user.totalWinnings?.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold">
                        <Gamepad2 size={10} /> {user.gamesPlayed || 0} Partidas
                      </div>
                      <div className="flex items-center gap-1.5 text-white/20 text-[9px] font-bold mt-1">
                        <Calendar size={10} /> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <span className={cn(
                        "w-fit px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider",
                        user.status === 'blocked' ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-400"
                      )}>
                        {user.status === 'blocked' ? 'Conta Suspensa' : 'Acesso Ativo'}
                      </span>
                      {user.isAdmin && (
                        <span className="w-fit px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-wider border border-amber-500/20">
                          Gerente Master
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => toggleAdminRole(user)}
                        className={cn(
                          "w-10 h-10 rounded-xl transition-all",
                          user.isAdmin ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20" : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                        )}
                        title={user.isAdmin ? "Rebaixar para Jogador" : "Promover a Gerente"}
                      >
                        {user.isAdmin ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => toggleUserStatus(user)}
                        className={cn(
                          "w-10 h-10 rounded-xl transition-all",
                          user.status === 'blocked' ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                        )}
                        title={user.status === 'blocked' ? "Ativar Conta" : "Bloquear Conta"}
                      >
                        {user.status === 'blocked' ? <UserCheck size={18} /> : <UserX size={18} />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
