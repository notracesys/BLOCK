
import React from 'react';

export function DecorativeFlags() {
  const colors = ['bg-junino-red', 'bg-junino-yellow', 'bg-junino-blue', 'bg-junino-orange'];
  
  return (
    <div className="relative w-full h-16 overflow-hidden bg-transparent pt-4">
      {/* Linha do varal (estilo corda) */}
      <div className="absolute top-6 inset-x-0 h-[1.5px] bg-slate-400/30 -rotate-1 z-0" />
      
      <div className="flex justify-center gap-1.5 px-2 relative z-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i} 
            className={`
              w-6 h-8 flag-clip shrink-0
              ${colors[i % colors.length]} 
              transition-transform duration-500
              ${i % 2 === 0 ? 'rotate-6 -translate-y-1' : '-rotate-6 translate-y-1'}
              hover:scale-110 shadow-md
            `}
          />
        ))}
      </div>
    </div>
  );
}
