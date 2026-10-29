
'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot, query, where, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { 
  UserCircle, 
  Plus, 
  Link as LinkIcon, 
  TrendingUp, 
  Users, 
  Loader2, 
  Search,
  X,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function InfluencersAdmin() {
  const db = useFirestore();
  const { user: authUser } = useUser();
  const { toast } = useToast();

  const [influencers, setInfluencers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdminRole, setIsAdminRole] = useState(false);

  // New Influencer Form
  const [newInfluencer, setNewInfluencer] = useState({
    name: '',
    code: '',
    commissionRate: 40,
    cpa: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!db || !authUser) return;

    // Verificar se é dono ou gerente
    getDoc(doc(db, 'users', authUser.uid)).then(snap => {
      const role = snap.data()?.role;
      setIsAdminRole(role === 'owner');

      // Se for dono, vê todos. Se for gerente, vê apenas os dele.
      let q = collection(db, 'influencers');
      if (role !== 'owner') {
        q = query(collection(db, 'influencers'), where('managerId', '==', authUser.uid)) as any;
      }

      const unsub = onSnapshot(q, (snap) => {
        const list: any[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        setInfluencers(list);
        setLoading(false);
      });

      return () => unsub();
    });
  }, [db, authUser]);

  const handleAddInfluencer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !authUser || !newInfluencer.name || !newInfluencer.code) return;
    setIsSaving(true);

    try {
      const codeClean = newInfluencer.code.toUpperCase().trim();
      
      const influencerData = {
        name: newInfluencer.name,
        code: codeClean,
        managerId: authUser.uid,
        commissionRate: newInfluencer.commissionRate,
        cpa: newInfluencer.cpa,
        clicks: 0,
        registrations: 0,
        activeUsers: 0,
        status: true,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'influencers'), influencerData);

      // Log de Auditoria
      await addDoc(collection(db, 'logs'), {
        action: 'NOVO_INFLUENCIADOR',
        details: `Influenciador ${newInfluencer.name} cadastrado com código ${codeClean}.`,
        actorId: authUser.uid,
        timestamp: new Date().toISOString()
      });

      toast({ title: "INFLUENCIADOR VINCULADO!", description: `O link para ${codeClean} já está ativo.` });
      setIsAddModalOpen(false);
      setNewInfluencer({ name: '', code: '', commissionRate: 40, cpa: 0 });
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: "Verifique os dados e tente novamente." });
    } finally {
      setIsSaving(false);
    }
  };

  const copyLink = (code: string) => {
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast({ title: "LINK COPIADO!", description: "Envie para o influenciador iniciar a campanha." });
  };

  const filtered = influencers.filter(i => 
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 md:p-12 space-y-8" id="admin-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight italic italic">Minha Tropa</h2>
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest mt-1">Gestão de links, CPA e performance de influenciadores.</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="h-14 bg-cyan-500 hover:bg-cyan-600 text-black font-black uppercase rounded-2xl px-8 shadow-xl active:scale-95 transition-all"
        >
          <Plus size={20} className="mr-2" /> VINCULAR INFLUENCIADOR
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Influencers', val: influencers.length, icon: UserCircle, color: 'text-cyan-400' },
          { label: 'Cliques na Rede', val: influencers.reduce((acc, i) => acc + (i.clicks || 0), 0), icon: Activity, color: 'text-emerald-400' },
          { label: 'Novos Cadastros', val: influencers.reduce((acc, i) => acc + (i.registrations || 0), 0), icon: Users, color: 'text-purple-400' },
          { label: 'Link Ativos', val: influencers.filter(i => i.status).length, icon: LinkIcon, color: 'text-amber-400' }
        ].map((s, i) => (
          <Card key={i} className="bg-[#111622] border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
            <div className={cn("w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center", s.color)}>
              <s.icon size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">{s.label}</span>
              <strong className="text-2xl font-black text-white">{s.val}</strong>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-[#111622] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Base de Influenciadores</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <Input 
              placeholder="Filtrar por nome ou código..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-11 bg-black/40 border-white/5 pl-12 rounded-xl text-xs font-bold"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/10 text-[10px] font-black uppercase text-white/30 tracking-[0.2em]">
                <th className="px-8 py-6">Influenciador / Código</th>
                <th className="px-8 py-6">Cliques</th>
                <th className="px-8 py-6">Conversão</th>
                <th className="px-8 py-6">Configuração</th>
                <th className="px-8 py-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-cyan-500 mx-auto" size={32} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-white/10 font-black uppercase tracking-widest italic">Nenhum influenciador vinculado</td>
                </tr>
              ) : filtered.map(i => (
                <tr key={i.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center font-black text-purple-400 border border-white/5 shadow-lg">
                        {i.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase tracking-tight">{i.name}</span>
                        <span className="text-[10px] font-black text-cyan-400 mt-0.5 tracking-widest">{i.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-white">{i.clicks || 0}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-emerald-400">{i.registrations || 0} Contas</span>
                      <span className="text-[9px] font-bold text-white/20 uppercase">{( (i.registrations || 0) / (i.clicks || 1) * 100).toFixed(1)}% Taxa</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-white/5 text-white/60 text-[9px] font-black">{i.commissionRate}% RS</Badge>
                      <Badge className="bg-white/5 text-white/60 text-[9px] font-black">R$ {i.cpa} CPA</Badge>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button 
                      onClick={() => copyLink(i.code)}
                      variant="ghost" 
                      className="h-10 bg-white/5 hover:bg-cyan-500 hover:text-black text-white/60 font-black text-[10px] uppercase rounded-xl px-4"
                    >
                      COPIAR LINK <LinkIcon size={14} className="ml-2" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-[#0d111c] border-white/10 p-0 overflow-hidden max-w-xl">
          <DialogHeader className="p-8 bg-[#111622] border-b border-white/5">
            <DialogTitle className="text-2xl font-black text-white uppercase italic italic">Vincular Novo Influenciador</DialogTitle>
            <DialogDescription className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Crie uma campanha exclusiva e acompanhe os resultados.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddInfluencer} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3 col-span-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Nome de Guerra / Identificação</label>
                <Input 
                  required
                  placeholder="Ex: Pedro Canal Tech" 
                  value={newInfluencer.name}
                  onChange={e => setNewInfluencer({...newInfluencer, name: e.target.value})}
                  className="h-14 bg-black/40 border-white/5 rounded-2xl font-bold"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Código de Cupom</label>
                <Input 
                  required
                  placeholder="EX: PEDRO10" 
                  value={newInfluencer.code}
                  onChange={e => setNewInfluencer({...newInfluencer, code: e.target.value})}
                  className="h-14 bg-black/40 border-white/5 rounded-2xl font-black text-cyan-400"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">CPA Fixo (R$)</label>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  value={newInfluencer.cpa}
                  onChange={e => setNewInfluencer({...newInfluencer, cpa: parseFloat(e.target.value)})}
                  className="h-14 bg-black/40 border-white/5 rounded-2xl font-black"
                />
              </div>

              <div className="space-y-3 col-span-2">
                <div className="flex justify-between">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-1">Revenue Share (%)</label>
                  <span className="text-sm font-black text-cyan-400">{newInfluencer.commissionRate}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={newInfluencer.commissionRate}
                  onChange={e => setNewInfluencer({...newInfluencer, commissionRate: parseInt(e.target.value)})}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>

            <Button 
              disabled={isSaving}
              className="w-full h-16 bg-cyan-500 hover:bg-cyan-600 text-black font-black text-lg uppercase rounded-2xl shadow-xl active:scale-95 transition-all mt-4"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : "GERAR LINK DE CAMPANHA"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
