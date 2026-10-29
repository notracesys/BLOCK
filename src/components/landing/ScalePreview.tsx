
import React from 'react';
import Image from 'next/image';

export function ScalePreview() {
  return (
    <div className="relative bg-white rounded-3xl p-6 shadow-inner overflow-hidden border-4 border-junino-beige max-w-sm mx-auto">
      <div className="flex flex-col items-center gap-6">
        {/* Realistic Comparison Box */}
        <div className="relative w-full aspect-[3/2.5] bg-slate-50 border-2 border-dashed border-junino-red flex items-end justify-center overflow-hidden rounded-2xl shadow-xl">
          
          {/* The Panel (Background) */}
          <div className="absolute inset-0 w-full h-full opacity-90">
            <Image
              src="/painel.png"
              alt="Painel Gigante Festa Junina"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay sutil para destacar a pessoa à frente */}
            <div className="absolute inset-0 bg-black/5" />
          </div>

          {/* The Person (mulher.png) - Scaled relative to 2.5m height */}
          {/* Ajustado para ~48% da altura para fazer o painel parecer ainda mais alto e imponente */}
          <div className="relative z-20 w-[35%] h-[48%] mb-6">
             <Image
              src="/mulher.png"
              alt="Comparativo Humano Real"
              fill
              className="object-contain object-bottom drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)]"
            />
          </div>
          
          {/* Overlay Info for measurements */}
          <div className="absolute left-3 top-3 z-30">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-junino-red/30">
              <span className="text-junino-red font-black text-[10px] block leading-none">PAINEL GIGANTE</span>
              <span className="text-slate-700 font-bold text-[8px] block mt-0.5">3.0m x 2.5m</span>
            </div>
          </div>

          {/* Measurement labels */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white bg-primary px-3 py-1 rounded-full text-[9px] font-black tracking-widest z-30 shadow-lg border border-white/20">
            3 METROS DE LARGURA
          </div>
        </div>

        <div className="text-center px-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
            Referência: Modelo com 1,70m de altura <br/>
            <span className="text-junino-red/60">Cenário ideal para fotos de corpo inteiro</span>
          </p>
        </div>
      </div>
    </div>
  );
}
