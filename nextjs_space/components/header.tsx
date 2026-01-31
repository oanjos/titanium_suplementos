'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap, Users } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const itemsCount = useCart((state) => state?.getItemsCount?.() ?? 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Zap className="h-6 w-6 text-black" fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">TITANIUM</span>
              <span className="text-xs text-muted-foreground -mt-1">SUPLEMENTOS</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Início
            </Link>
            <Link
              href="/produtos"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Produtos
            </Link>
            <Link
              href="/rastrear-pedido"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Rastrear Pedido
            </Link>
            <Link
              href="/admin/login"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Parceiros
            </Link>
          </nav>

          {/* Cart Button */}
          <div className="flex items-center gap-2">
            <Link href="/admin/login" aria-label="Acesso parceiros">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <Users className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/carrinho">
              <Button variant="outline" size="sm" className="relative gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Carrinho</span>
                {mounted && itemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-black">
                    {itemsCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
