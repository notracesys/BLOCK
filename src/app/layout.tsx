import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/index';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const metadata: Metadata = {
  title: 'Block Blast - Encaixe e Ganhe',
  description: 'O melhor jogo de block puzzle onde você fatura de verdade.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans selection:bg-primary/30">
        <FirebaseClientProvider>
          <FirebaseErrorListener />
          <div className="mobile-container bg-grid-pattern">
            {children}
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
