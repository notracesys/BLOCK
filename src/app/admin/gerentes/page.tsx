'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, getDocs, limit, addDoc } from 'firebase/firestore';
import { 
  Users, 
  Search, 
  UserPlus, 
  TrendingUp, 
  UserCircle,
  Loader2,
  Lock,
  Percent,
  Activity,
  ChevronRight,
  X,
  ShieldCheck,
  SearchCode
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ManagersAdmin() {
  const db = useFirestore();
  const { user: authUser, role } = useUser();
  const { toast } = useToast();

  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManager, setSelectedManager] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  
  const [newManagerData, setNewManagerData] = useState({
    commission: 10,
    permissions: {
      canViewGlobalRevenue: true,
      canChangeDifficulty: false,
      canModerateUsers: true,
      canManageInfluencers: true
    }
  });

  useEffect(() => {
    if (!db || !authUser || role !== 'owner') return;

    // Apenas Owner lista gerentes
    const q = query(collection(db, 'users'), where('role', '==', 'manager'));
    
    const unsub = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setManagers(list);
      setLoading(false);
    }, (error) => {
      console.warn("[GERENTES] Acesso limitado ou erro de query.");
      setLoading(false);
    });

    return () => unsub();
  }, [db, authUser, role]);

  const handleSearchUser = async () => {
    if (!db || !searchQuery) return;
    setIsSearching(true);
    setFoundUser(null);
    try {
      const q = query(collection(db, 'users'), where('email', '==', searchQuery.toLowerCase().trim()), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setFoundUser({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        toast({ variant: "destructive", title: "Usuário não encontrado" });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Erro na busca" });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePromoteToManager = async () => {
    if (!db || !foundUser || !authUser) return;
    setIsPromoting(true);
    try {
      const userRef = doc(db, 'users', foundUser.id);
      await updateDoc(userRef, {
        isAdmin: true,
        role: 'manager',
        managerCommissionRate: newManagerData.commission,
        permissions: newManagerData.permissions,
        lastPromotedAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'logs'), {
        action: 'PROMOÇÃO_GERENTE',
        details: `Usuário ${foundUser.email} promovido a Gerente.`,
        actorId: authUser.uid,
        timestamp: new Date().toISOString()
      });

      toast({ title: "GERENTE ATIVADO!" });
      setIsAddModalOpen(false);
      setFoundUser(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao salvar" });
    } finally {
      setIsPromoting(false);
    }
  };

  const filteredManagers = managers.filter(m => 
    m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (role !== 'owner') {
    return <div className="p-10 text-white/20 font-black uppercase italic">Acesso Restrito ao Proprietário</div>;
  }

  return (
    <div className="p-8 md:p-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic">Corpo Administrativo</h2>
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest mt-1">Gestão master de sub-operadores.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="h-14 bg-cyan-500 hover:bg-cyan-600 text-black font-black uppercase rounded-2xl px-8 shadow-xl">
          <UserPlus size={20} className="mr-2" /> VINCULAR GERENTE
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#111622] border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400"><Users size={24} /></div>
          <div><span className="text-[10px] font-black text-white/20 uppercase block">Gerentes Ativos</span><strong className="text-2xl font-black text-white">{managers.length}</strong></div>
        </Card>
        <Card className="bg-[#111622] border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"><TrendingUp size={24} /></div>
          <div><span className="text-[10px] font-black text-white/20 uppercase block">Rede Total</span><strong className="text-2xl font-black text-white">0</strong></div>
        </Card>
        <Card className="bg-[#111622] border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400"><Activity size={24} /></div>
          <div><span className="text-[10px] font-black text-white/20 uppercase block">Cliques Rede</span><strong className="text-2xl font-black text-white">0</strong></div>
        </Card>
      </div>

      <div className="bg-[#111622] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-black/20 text-[10px] font-black uppercase text-white/30 tracking-widest">
              <th className="px-8 py-6">Identificação</th>
              <th className="px-8 py-6">Comissão</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={4} className="px-8 py-20 text-center"><Loader2 className="animate-spin text-cyan-500 mx-auto" size={32} /></td></tr>
            ) : filteredManagers.map(m => (
              <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black">{m.fullName?.charAt(0)}</div>
                    <div className="flex flex-col"><span className="text-sm font-black text-white uppercase">{m.fullName}</span><span className="text-[10px] text-white/20">{m.email}</span></div>
                  </div>
                </td>
                <td className="px-8 py-6"><span className="text-sm font-black text-emerald-400">{m.managerCommissionRate || 0}%</span></td>
                <td className="px-8 py-6"><Badge className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase">{m.status || 'ATIVO'}</Badge></td>
                <td className="px-8 py-6 text-right">
                  <Button onClick={() => { setSelectedManager(m); setIsSheetOpen(true); }} variant="ghost" className="bg-white/5 hover:bg-cyan-500 text-white/60 hover:text-black font-black text-[10px] rounded-xl uppercase">GERENCIAR <ChevronRight size={14} className="ml-2" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-[#0d111c] border-white/10 p-0 overflow-hidden max-w-xl">
          <DialogHeader className="p-8 bg-[#111622] border-b border-white/5">
            <DialogTitle className="text-2xl font-black text-white uppercase italic">Vincular Gerente</DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6">
            {!foundUser ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <SearchCode className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <Input placeholder="usuario@email.com" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-14 bg-black/40 border-white/5 pl-12 rounded-2xl font-bold" />
                </div>
                <Button onClick={handleSearchUser} disabled={isSearching} className="h-14 bg-white/5 text-white font-black px-6 rounded-2xl">{isSearching ? <Loader2 className="animate-spin" /> : "BUSCAR"}</Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-cyan-500/5 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center text-black font-black">{foundUser.fullName?.charAt(0)}</div>
                  <div className="flex-1"><h4 className="text-sm font-black text-white uppercase">{foundUser.fullName}</h4><p className="text-xs text-white/40">{foundUser.email}</p></div>
                  <Button variant="ghost" onClick={() => setFoundUser(null)} className="text-rose-500 text-[10px] font-black uppercase">Trocar</Button>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Percentual de Comissão (%)</label>
                  <Input type="number" value={newManagerData.commission} onChange={e => setNewManagerData({...newManagerData, commission: parseInt(e.target.value)})} className="h-12 bg-black/40 border-white/5 rounded-xl font-black" />
                </div>
                <Button onClick={handlePromoteToManager} disabled={isPromoting} className="w-full h-16 bg-cyan-500 hover:bg-cyan-600 text-black font-black text-lg rounded-2xl shadow-xl uppercase">
                  {isPromoting ? <Loader2 className="animate-spin" /> : "CONFIRMAR PROMOÇÃO"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl bg-[#0d111c] border-white/5 p-0 flex flex-col">
          {selectedManager && (
            <>
              <SheetHeader className="p-8 bg-[#111622] border-b border-white/5 relative">
                <button onClick={() => setIsSheetOpen(false)} className="absolute top-6 right-6 text-white/40"><X size={24} /></button>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl font-black text-cyan-400">{selectedManager.fullName?.charAt(0)}</div>
                  <div><SheetTitle className="text-2xl font-black text-white uppercase italic">{selectedManager.fullName}</SheetTitle><Badge className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase mt-1">Gerente Nível 1</Badge></div>
                </div>
              </SheetHeader>
              <Tabs defaultValue="overview" className="flex-1 flex flex-col p-8">
                <TabsList className="bg-[#111622] p-1 rounded-xl mb-6">
                  <TabsTrigger value="overview" className="flex-1 font-black text-[10px] uppercase">Geral</TabsTrigger>
                  <TabsTrigger value="permissions" className="flex-1 font-black text-[10px] uppercase">Permissões</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-black/20 p-4 border-white/5">
                      <span className="text-[10px] font-black text-white/20 uppercase">Volume Rede</span>
                      <div className="text-xl font-black text-white mt-1">R$ 0,00</div>
                    </Card>
                    <Card className="bg-black/20 p-4 border-white/5">
                      <span className="text-[10px] font-black text-white/20 uppercase">Comissões</span>
                      <div className="text-xl font-black text-emerald-400 mt-1">R$ 0,00</div>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="permissions" className="space-y-4">
                   {['canViewGlobalRevenue', 'canChangeDifficulty', 'canModerateUsers'].map(p => (
                     <div key={p} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                       <span className="text-xs font-bold text-white/60 uppercase">{p}</span>
                       <Switch checked={selectedManager.permissions?.[p]} />
                     </div>
                   ))}
                </TabsContent>
              </Tabs>
              <div className="p-8 border-t border-white/5 bg-[#111622] flex gap-4">
                <Button className="flex-1 h-14 bg-rose-500 text-white font-black uppercase rounded-2xl"><Lock size={18} className="mr-2" /> BLOQUEAR ACESSO</Button>
                <Button onClick={() => setIsSheetOpen(false)} className="h-14 bg-white/5 text-white font-black px-8 rounded-2xl uppercase">FECHAR</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}