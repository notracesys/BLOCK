"use client";

import React, { useState } from 'react';
import { aiPartyPlanningAssistant, AiPartyPlanningAssistantOutput } from '@/ai/flows/ai-party-planning-assistant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Loader2, Music, Utensils, Paintbrush } from 'lucide-react';

export function AIPlannerAssistant() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiPartyPlanningAssistantOutput | null>(null);
  const [form, setForm] = useState({
    eventSize: '50 pessoas',
    theme: 'Tradicional Caipira'
  });

  async function handlePlan() {
    setLoading(true);
    try {
      const output = await aiPartyPlanningAssistant(form);
      setResult(output);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-4">
      <Card className="border-2 border-junino-yellow shadow-xl bg-white overflow-hidden">
        <div className="h-2 bg-junino-yellow" />
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-junino-red">
            <Sparkles className="text-junino-yellow fill-current" />
            Assistente IA do Arraiá
          </CardTitle>
          <CardDescription>
            Planeje cada detalhe da sua festa junina em segundos com nossa inteligência artificial.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="size">Tamanho do Evento</Label>
              <Input 
                id="size" 
                placeholder="Ex: 20 pessoas, escola, creche..." 
                value={form.eventSize}
                onChange={e => setForm({...form, eventSize: e.target.value})}
                className="bg-junino-beige/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Tema / Estilo</Label>
              <Input 
                id="theme" 
                placeholder="Ex: Rústico, Moderno, Infantil..." 
                value={form.theme}
                onChange={e => setForm({...form, theme: e.target.value})}
                className="bg-junino-beige/30"
              />
            </div>
          </div>
          <Button 
            onClick={handlePlan} 
            disabled={loading}
            className="w-full bg-junino-red hover:bg-junino-red/90 text-white font-bold h-12 text-lg shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
            GERAR PLANO COMPLETO
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
          <Card className="border-t-4 border-t-junino-blue">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-junino-blue">
                <Paintbrush className="w-5 h-5" /> Decoração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                {result.decorationIdeas.map((idea, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-junino-blue">•</span> {idea}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-junino-orange">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-junino-orange">
                <Music className="w-5 h-5" /> Músicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                {result.musicPlaylistSuggestions.map((song, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-junino-orange">•</span> {song}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-junino-yellow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-junino-yellow">
                <Utensils className="w-5 h-5" /> Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                {result.recipeSuggestions.map((recipe, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-junino-yellow">•</span> {recipe}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}