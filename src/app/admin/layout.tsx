
'use client';

import React, { useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  UserCircle, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Loader2,
  Users as UsersIcon,
  Gamepad2,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * ADMIN GATEKEEPER
 * Só renderiza se for OWNER confirmado no Firestore
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  useEffect(() => {
    // Redireciona apenas se o carregamento terminou e não for owner
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (role !== 'owner') {
        router.push(role === 'manager' ? '/manager' : '/painel');
      }
    }
  }, [user, role, loading, router]);

  // Enquanto valida, mostra uma tela de carregamento profissional
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#08090d]">
        <Loader2 className="animate-spin text-cyan-500 mb-4" size={32} />
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Validando Acesso Master...</span>
      </div>
    );
  }

  // Trava de segurança final
  if (role !== 'owner') return null;

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Gerentes', icon: ShieldCheck, href: '/admin/managers' },
    { label: 'Influenciadores', icon: UserCircle, href: '/admin/influenciadores' },
    { label: 'Usuários', icon: UsersIcon, href: '/admin/usuarios' },
    { label: 'Partidas', icon: Gamepad2, href: '/admin/partidas' },
    { label: 'Config. Jogo', icon: Settings, href: '/admin/configuracoes' },
    { label: 'Logs', icon: FileText, href: '/admin/logs' },
  ];

  return (
    <div className="min-h-screen bg-[#08090d] flex" id="admin-page">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#111622] border-r border-white/5 transition-transform md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center justify-between">
            <Image src="/blockcash.png" alt="Logo" width={100} height={40} className="filter brightness-125" />
            <Button variant="ghost" size="icon" className="md:hidden text-white/40" onClick={() => setSidebarOpen(false)}><X size={20} /></Button>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                  pathname === item.href ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-white/40 hover:bg-white/5 hover:text-white"
                )}>
                  <item.icon size={18} />
                  {item.label}
                  {pathname === item.href && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </div>
              </Link>
            ))}
          </nav>
          <div className="p-6 border-t border-white/5">
            <Button onClick={() => auth?.signOut().then(() => router.push('/'))} variant="ghost" className="w-full justify-start gap-3 text-rose-500 hover:bg-rose-500/10 rounded-xl">
              <LogOut size={18} /> Sair
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-[#111622]/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden text-white" onClick={() => setSidebarOpen(true)}><Menu size={24} /></Button>
            <h1 className="text-sm font-black uppercase tracking-widest text-white/60">Terminal <span className="text-cyan-400 ml-2">/ OWNER</span></h1>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black uppercase text-cyan-400">{user?.email}</span>
            <span className="text-[8px] font-bold text-white/20">Sessão Administrador</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
