'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { 
  Zap, 
  Grid3X3, 
  Save, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SettingsAdmin() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [config, setConfig] = useState<any>({ 
    difficulty: 50, 
    gridSize: 8, 
    maxLinesPerMatch: 5, 
    antiFraudEnabled: true, 
    totalDeposited: 0 
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !user) return;
    
    const settingsRef = doc(db, 'settings', 'game');
    
    const unsub = onSnapshot(settingsRef, (snap) => {
      setLoading(false);
      if (snap.exists()) {
        setConfig(snap.data());
      }
    }, (err) => {
      console.log("[SETTINGS] Sincronizando com o servidor...");
      setLoading(false);
    });

    return () => unsub();
  }, [db, user]);

  const handleSave = async () => {
    if (!db || !user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'game'), {
        ...config,
        lastUpdatedBy: user.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      toast({ 
        title: "SISTEMA ATUALIZADO!", 
        description: "As novas regras da arena entraram em vigor." 
      });
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "ACESSO NEGADO", 
        description: "Você não tem permissão para alterar as regras globais." 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-cyan-500 mb-4" size={32} />
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Carregando Configurações...</span>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 space-y-10" id="admin-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Controle Absoluto</h2>
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest mt-1">Ajuste os parâmetros da plataforma em tempo real.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="h-14 bg-cyan-500 hover:bg-cyan-600 text-black font-black uppercase px-10 rounded-2xl shadow-[0_10px_30px_rgba(6,182,212,0.3)] transition-all active:scale-95"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save className="mr-2" size={20} />}
          APLICAR NA ARENA
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="bg-[#111622] border-white/5 p-10 rounded-[3rem] space-y-10">
          <div className="flex items-center gap-4 text-cyan-400">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase text-white">Motor de Dificuldade</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Chance de Peças Complexas</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Poder de Retenção</span>
              <span className="text-6xl font-black text-white">{config.difficulty}%</span>
            </div>
            
            <Slider 
              value={[config.difficulty || 0]} 
              onValueChange={v => setConfig({...config, difficulty: v[0]})}
              max={100}
              step={1}
              className="py-6"
            />

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Lucrativo', val: 0 },
                { label: 'Equilibrado', val: 50 },
                { label: 'Dreno Máximo', val: 100 }
              ].map(item => (
                <button 
                  key={item.val}
                  onClick={() => setConfig({...config, difficulty: item.val})}
                  className={cn(
                    "py-4 rounded-2xl text-[10px] font-black uppercase border transition-all",
                    config.difficulty === item.val 
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
                      : "bg-black/20 border-white/5 text-white/40"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="bg-[#111622] border-white/5 p-10 rounded-[3rem] space-y-10">
          <div className="flex items-center gap-4 text-purple-400">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
              <Grid3X3 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase text-white">Regras da Partida</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Limites de Jogabilidade</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Tamanho do Grid</label>
              <Input 
                type="number" 
                value={config.gridSize} 
                onChange={e => setConfig({...config, gridSize: parseInt(e.target.value)})}
                className="h-14 bg-black/40 border-white/5 rounded-2xl font-black text-lg"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Meta de Linhas</label>
              <Input 
                type="number" 
                value={config.maxLinesPerMatch} 
                onChange={e => setConfig({...config, maxLinesPerMatch: parseInt(e.target.value)})}
                className="h-14 bg-black/40 border-white/5 rounded-2xl font-black text-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-black/40 p-6 rounded-3xl border border-white/5">
            <div className="flex flex-col">
              <span className="text-sm font-black text-white uppercase">Escudo Ativo</span>
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Proteção Antifraude</span>
            </div>
            <Switch 
              checked={config.antiFraudEnabled} 
              onCheckedChange={v => setConfig({...config, antiFraudEnabled: v})} 
            />
          </div>
        </Card>
      </div>

      <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem] flex items-center gap-6">
        <CheckCircle2 className="text-emerald-500" size={32} />
        <div className="space-y-1">
          <h4 className="text-sm font-black text-white uppercase italic">Status: Arena Conectada</h4>
          <p className="text-[11px] text-white/40 font-medium">As alterações feitas aqui refletem instantaneamente para todos os jogadores online.</p>
        </div>
      </div>
    </div>
  );
}