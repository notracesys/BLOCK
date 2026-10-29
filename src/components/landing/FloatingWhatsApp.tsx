import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingWhatsApp() {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <a 
        href="https://wa.me/your-number" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <Button 
          size="lg" 
          className="rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-2xl h-16 w-16 p-0 border-4 border-white"
        >
          <MessageCircle className="w-8 h-8 fill-current" />
        </Button>
      </a>
    </div>
  );
}