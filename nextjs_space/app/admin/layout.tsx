'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import {
  Zap,
  LayoutDashboard,
  Package,
  Ticket,
  ShoppingCart,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/cupons', label: 'Cupons', icon: Ticket },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [needsAttentionCount, setNeedsAttentionCount] = useState<number | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }
    let isMounted = true;
    const fetchNeedsAttentionCount = async () => {
      try {
        const res = await fetch('/api/admin/produtos?needsAttention=true&countOnly=true');
        const data = await res.json();
        if (!res.ok) {
          return;
        }
        if (isMounted) {
          setNeedsAttentionCount(
            typeof data?.count === 'number' ? data.count : 0
          );
        }
      } catch {
        if (isMounted) {
          setNeedsAttentionCount(0);
        }
      }
    };
    fetchNeedsAttentionCount();
    return () => {
      isMounted = false;
    };
  }, [status]);


  // Se estiver na página de login, não aplicar o layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ff41]"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-[#00ff41]" />
          <span className="font-bold text-white">Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 transition-transform duration-200 ease-in-out`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-zinc-800">
              <Link href="/admin" className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-[#00ff41]" />
                <span className="text-xl font-bold text-white">Titanium Admin</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#00ff41]/10 text-[#00ff41]'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.href === '/admin/produtos' &&
                      (needsAttentionCount ?? 0) > 0 && (
                        <span className="ml-auto rounded-full bg-[#ff3b30] px-2 py-0.5 text-xs font-semibold text-white">
                          {needsAttentionCount}
                        </span>
                      )}
                  </Link>
                );
              })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-zinc-800">
              <div className="mb-3 px-4">
                <p className="text-sm text-zinc-400">Logado como</p>
                <p className="text-white font-medium truncate">{session.user?.name}</p>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
      <Toaster position="top-center" richColors />
    </SessionProvider>
  );
}

