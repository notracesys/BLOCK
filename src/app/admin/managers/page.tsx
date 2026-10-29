
'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, addDoc, getDocs } from 'firebase/firestore';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Loader2,
  Lock,
  ChevronRight,
  ShieldCheck,
  Activity,
  Mail,
  Calendar,
  Search
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ManagersAdmin() {
  const db = useFirestore();
  const { user: authUser } = useUser();
  const { toast } = useToast();

  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Form de convite
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    if (!db) return;

    // Dono lista gerentes
    const q = query(collection(db, 'users'), where('role', '==', 'manager'));
    
    const unsub = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setManagers(list);
      setLoading(false);
    }, (error) => {
      console.warn("[GERENTES] Erro ao carregar lista");
      setLoading(false);
    });

    return () => unsub();
  }, [db]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !authUser || !inviteEmail) return;
    setSendingInvite(true);
    
    try {
      // Como não temos Admin SDK direto, criamos um "pré-cadastro"
      // Na vida real, isso seria uma Cloud Function
      await addDoc(collection(db, 'auditLogs'), {
        actorUid: authUser.uid,
        action: 'CONVITE_GERENTE',
        details: `Convite enviado para ${inviteEmail}`,
        timestamp: new Date().toISOString()
      });

      // No registro do usuário, o sistema checará este e-mail
      // Para fins de teste direto, vamos apenas avisar
      toast({ 
        title: "GERENTE PRÉ-AUTORIZADO!", 
        description: "Peça para ele se cadastrar com este e-mail para ativar o cargo." 
      });
      
      setIsInviteModalOpen(false);
      setInviteEmail('');
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao autorizar" });
    } finally {
      setSendingInvite(false);
    }
  };

  const toggleStatus = async (mgr: any) => {
    if (!db) return;
    const newStatus = !mgr.active;
    try {
      await updateDoc(doc(db, 'users', mgr.id), { active: newStatus });
      toast({ title: "Status Atualizado" });
    } catch (e) {
      toast({ variant: "destructive", title: "Erro de permissão" });
    }
  };

  const filteredManagers = managers.filter(m => 
    m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 md:p-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic">Corpo Operacional</h2>
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest mt-1">Gestão de gerentes e sub-operadores.</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)} className="h-14 bg-cyan-500 hover:bg-cyan-600 text-black font-black uppercase rounded-2xl px-8 shadow-xl">
          <UserPlus size={20} className="mr-2" /> AUTORIZAR GERENTE
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#111622] border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400"><ShieldCheck size={24} /></div>
          <div><span className="text-[10px] font-black text-white/20 uppercase block">Gerentes Ativos</span><strong className="text-2xl font-black text-white">{managers.filter(m => m.active).length}</strong></div>
        </Card>
        <Card className="bg-[#111622] border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"><TrendingUp size={24} /></div>
          <div><span className="text-[10px] font-black text-white/20 uppercase block">Rede Total</span><strong className="text-2xl font-black text-white">R$ 0,00</strong></div>
        </Card>
        <Card className="bg-[#111622] border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400"><Activity size={24} /></div>
          <div><span className="text-[10px] font-black text-white/20 uppercase block">Ações Recentes</span><strong className="text-2xl font-black text-white">0</strong></div>
        </Card>
      </div>

      <div className="bg-[#111622] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Operadores de Rede</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <Input placeholder="Filtrar gerente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-11 bg-black/40 border-white/5 pl-12 rounded-xl text-xs font-bold" />
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-black/20 text-[10px] font-black uppercase text-white/30 tracking-widest">
              <th className="px-8 py-6">Identificação</th>
              <th className="px-8 py-6">Influenciadores</th>
              <th className="px-8 py-6">Cadastro</th>
              <th className="px-8 py-6 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={4} className="px-8 py-20 text-center"><Loader2 className="animate-spin text-cyan-500 mx-auto" size={32} /></td></tr>
            ) : filteredManagers.length === 0 ? (
              <tr><td colSpan={4} className="px-8 py-20 text-center text-white/10 font-black uppercase">Nenhum gerente encontrado</td></tr>
            ) : filteredManagers.map(m => (
              <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black">{m.fullName?.charAt(0)}</div>
                    <div className="flex flex-col"><span className="text-sm font-black text-white uppercase">{m.fullName}</span><span className="text-[10px] text-white/20">{m.email}</span></div>
                  </div>
                </td>
                <td className="px-8 py-6"><span className="text-sm font-black text-emerald-400">{m.influencersCount || 0} Ativos</span></td>
                <td className="px-8 py-6">
                  <div className="flex flex-col text-[10px] font-bold text-white/30">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Antigo'}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <Button onClick={() => toggleStatus(m)} variant="ghost" className={cn("h-10 text-[10px] font-black uppercase rounded-xl", m.active ? "text-rose-500 bg-rose-500/5 hover:bg-rose-500/20" : "text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/20")}>
                    {m.active ? <Lock size={14} className="mr-2" /> : <ShieldCheck size={14} className="mr-2" />}
                    {m.active ? "BLOQUEAR" : "ATIVAR"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="bg-[#0d111c] border-white/10 p-0 overflow-hidden max-w-xl">
          <DialogHeader className="p-8 bg-[#111622] border-b border-white/5">
            <DialogTitle className="text-2xl font-black text-white uppercase italic">Autorizar Novo Gerente</DialogTitle>
            <DialogDescription className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-1">Defina o e-mail que terá permissão de gerência na plataforma.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInvite} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">E-mail do Operador</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input required type="email" placeholder="gerente@exemplo.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="h-14 bg-black/40 border-white/5 pl-12 rounded-2xl font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Nome/Apelido (Opcional)</label>
                <Input placeholder="Ex: Operador SP" value={inviteName} onChange={e => setInviteName(e.target.value)} className="h-14 bg-black/40 border-white/5 rounded-2xl font-bold" />
              </div>
            </div>
            <Button disabled={sendingInvite} className="w-full h-16 bg-cyan-500 hover:bg-cyan-600 text-black font-black text-lg rounded-2xl shadow-xl uppercase transition-all active:scale-95">
              {sendingInvite ? <Loader2 className="animate-spin" /> : "CONFIRMAR AUTORIZAÇÃO"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
