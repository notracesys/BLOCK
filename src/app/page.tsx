'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Play, 
  Star,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Award,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen text-white bg-[#06122b] selection:bg-cyan-500/30">
      <header className="fixed top-0 max-w-[480px] w-full mx-auto left-0 right-0 z-[100] flex items-center justify-between px-4 h-20 bg-[#06122b]/80 backdrop-blur-xl border-b border-b-white/5">
        <div className="flex items-center">
          <Image 
            src="/blockcash.png" 
            alt="Block Cash Logo" 
            width={64} 
            height={64} 
            className="object-contain"
            priority
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/login">
            <button className="text-[11px] font-bold text-white/70 uppercase tracking-wider hover:text-white transition-colors py-1.5 px-3 rounded-xl border border-white/10 bg-white/5">
              ENTRAR
            </button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-gradient-to-r from-[#7b61ff] to-[#5a42d8] text-white hover:opacity-90 px-3.5 h-8 font-black text-[11px] uppercase tracking-wider rounded-xl glow-purple border border-purple-400/20">
              CRIAR CONTA
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-24 px-4 pb-20 space-y-8 w-full">
        <section className="text-center space-y-4 pt-4">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a2046]/90 border border-cyan-500/30 text-[11px] font-bold text-cyan-400 uppercase tracking-wider backdrop-blur-sm shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-white/90 font-semibold"><strong className="text-emerald-400 font-black">3.083</strong> jogadores online</span>
            </div>
          </div>

          <h1 className="text-3xl font-[900] tracking-tight text-white uppercase text-center leading-[1.1]">
            ENCAIXE OS BLOCOS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#35f59a] to-[#26d9ff] font-black drop-shadow-[0_2px_10px_rgba(38,217,255,0.2)]">
              E GANHE R$
            </span>
          </h1>

          <div className="relative w-full aspect-square bg-[#0b1d3f] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl animate-float group">
            <Image 
              src="/hero.webp" 
              alt="Block Blast Game Screen" 
              fill 
              className="object-contain transition-transform duration-700 group-hover:scale-105"
              priority
              data-ai-hint="game screen"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none flex flex-col justify-end p-6">
              <div className="bg-black/50 backdrop-blur-md self-start px-3 py-1 rounded-full border border-white/10">
                <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold">
                  Experiência visual demonstrativa
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3.5">
          <Link href="/demo" className="block w-full">
            <Button className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#35f59a] to-[#26d9ff] hover:opacity-95 text-slate-950 font-black text-base glow-green transition-all hover:scale-[1.01] active:scale-95 uppercase tracking-wide animate-shine flex items-center justify-between px-5 border border-emerald-300/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-950/10 rounded-xl flex items-center justify-center">
                  <Play className="w-5 h-5 fill-current text-slate-950" />
                </div>
                <div className="text-left">
                  <div className="font-black text-[15px] tracking-wide text-slate-950">JOGAR GRÁTIS</div>
                  <div className="text-[10px] opacity-80 font-bold text-slate-900">Abrir modo demonstração</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-950" />
            </Button>
          </Link>

          <Link href="/register" className="block w-full">
            <Button className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#7b61ff] to-[#5a42d8] hover:opacity-95 text-white font-black text-base glow-purple transition-all hover:scale-[1.01] active:scale-95 uppercase tracking-wide flex items-center justify-between px-5 border border-purple-400/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center font-black text-sm">
                  +
                </div>
                <div className="text-left">
                  <div className="font-black text-[15px] tracking-wide">CRIAR CONTA</div>
                  <div className="text-[10px] text-white/70 font-medium">Comece em poucos segundos</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80" />
            </Button>
          </Link>

          <div className="text-center pt-2">
            <Link href="/login" className="text-white/50 hover:text-cyan-400 transition-colors text-[12px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
              Já tenho conta <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'JOGADORES NA ARENA', value: '1.933', icon: Users, color: 'text-cyan-400' },
            { label: 'PRÊMIOS HOJE', value: 'R$ 8.523', icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'MAIOR PRÊMIO HOJE', value: 'R$ 987', icon: Award, color: 'text-amber-400' }
          ].map((stat, i) => {
            const IconComponent = stat.icon;
            return (
              <div key={i} className="bg-[#0b1d3f]/70 backdrop-blur-sm border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-md">
                <IconComponent className={`w-4 h-4 ${stat.color} mb-1 opacity-80`} />
                <span className={`text-[13px] font-black ${stat.color} tracking-tight`}>{stat.value}</span>
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-tight mt-1 leading-tight">{stat.label}</span>
              </div>
            );
          })}
        </section>

        <section className="space-y-6 pt-6 border-t border-white/5">
          <div className="text-center space-y-1">
            <span className="text-cyan-400 text-[11px] font-black uppercase tracking-[0.25em]">PASSO A PASSO</span>
            <h2 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
              Aprenda a faturar em <br/> 4 passos simples
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { 
                step: 1, 
                title: '1. Deposite via PIX', 
                desc: 'Adicione saldo à sua conta de forma rápida e segura para começar a jogar Block Blast.',
                img: '/card1.webp'
              },
              { 
                step: 2, 
                title: '2. Escolha sua entrada', 
                desc: 'Defina quanto quer apostar por partida. Quanto maior a entrada, maior a recompensa mínima.',
                img: '/card2.webp'
              },
              { 
                step: 3, 
                title: '3. Monte e exploda linhas', 
                desc: 'Encaixe as peças no tabuleiro 8x8. Cada linha ou coluna completa explode e acumula prêmios.',
                img: '/card3.png'
              },
              { 
                step: 4, 
                title: '4. Resgate e saque', 
                desc: 'Bateu a meta de 2x? Faça o cashout e retire seus ganhos via PIX na hora.',
                img: '/card4.webp'
              }
            ].map((step) => (
              <Card key={step.step} className="bg-[#0b1d3f]/40 border-white/5 overflow-hidden rounded-[1.5rem] group transition-all duration-300 hover:border-white/10">
                <div className="relative aspect-[2.4/1] w-full">
                  <Image 
                    src={step.img} 
                    alt={step.title} 
                    fill 
                    className="object-contain opacity-95 group-hover:opacity-100 transition-opacity" 
                    data-ai-hint="payment screen"
                  />
                  <div className="absolute top-3 left-3 w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center font-black text-white text-xs shadow-xl border border-white/10">
                    {step.step}
                  </div>
                </div>
                <CardContent className="p-4 space-y-1">
                  <h3 className="text-[13px] font-black text-white uppercase tracking-wide">{step.title}</h3>
                  <p className="text-white/50 text-[11px] leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6 pt-6 border-t border-white/5">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              QUEM JOGA, RECOMENDA!
            </h2>
            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">Resultados reais diários</p>
          </div>

          <div className="space-y-3.5">
            {[
              {
                name: 'Rafael Martins',
                initials: 'RM',
                text: 'Comecei com R$ 10 e resgatei R$ 20 na primeira partida. O jogo é bom demais, muito fácil. O PIX caiu na hora!',
                role: '✓ Usuário verificado'
              },
              {
                name: 'Camila Souza',
                initials: 'CS',
                text: 'Já era viciado em Block Blast de qualquer forma, agora ainda ganho dinheiro jogando. A tática é resgatar cedo e não ser ganancioso.',
                role: '✓ Usuário verificado'
              },
              {
                name: 'Bruno Lima',
                initials: 'BL',
                text: 'Interface limpa, sem enrolação. Depositei, joguei e saquei no mesmo dia. Cada linha que explode é muito satisfatório.',
                role: '✓ Usuário verificado'
              }
            ].map((testimonial, i) => (
              <Card key={i} className="bg-[#0b1d3f]/50 border-white/5 p-4 rounded-[1.5rem] border-l-2 border-l-cyan-500/40">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                  ))}
                </div>
                <p className="text-[11px] text-white/80 italic mb-3.5 leading-relaxed font-medium">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center font-black text-cyan-400 text-[10px] border border-white/10 uppercase">
                    {testimonial.initials}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wide leading-none">{testimonial.name}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider">{testimonial.role}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-8 px-4 bg-gradient-to-b from-transparent to-cyan-500/5 rounded-[2rem] text-center space-y-4 border border-white/5">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-white uppercase leading-tight">
              PRONTO PARA <br /> MONTAR E GANHAR?
            </h2>
            <p className="text-white/40 text-[11px] font-medium max-w-[260px] mx-auto leading-relaxed">
              Crie sua conta grátis, deposite a partir de R$ 20 e comece agora mesmo.
            </p>
          </div>

          <Link href="/register" className="block w-full">
            <Button className="w-full h-14 rounded-xl bg-gradient-to-r from-[#35f59a] to-[#26d9ff] text-slate-950 font-black text-sm shadow-xl glow-green transition-all uppercase tracking-wider animate-shine">
              CRIAR CONTA GRÁTIS
            </Button>
          </Link>

          <div className="text-[8px] text-white/30 uppercase tracking-widest font-bold">
            Cadastro rápido • experiência demonstrativa
          </div>
        </section>
      </main>

      <footer className="px-4 py-6 border-t border-white/5 space-y-3 text-center bg-black/20">
        <div className="flex justify-center items-center">
          <Image 
            src="/blockcash.png" 
            alt="Block Cash Logo" 
            width={32} 
            height={32} 
            className="object-contain"
          />
        </div>
        
        <div className="space-y-1">
          <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider">
            &copy; 2026 Block Cash. Todos os direitos reservados.
          </p>
          <div className="text-white/20 text-[8px] font-black uppercase tracking-wider max-w-[260px] mx-auto leading-relaxed">
            Jogue com responsabilidade. Proibido para menores de 18 anos.
          </div>
        </div>
      </footer>
    </div>
  );
}
