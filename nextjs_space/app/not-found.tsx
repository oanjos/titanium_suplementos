import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-16">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold">Página Não Encontrada</h2>
          <p className="text-muted-foreground max-w-md">
            Desculpe, a página que você está procurando não existe ou foi movida.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/">
            <Button className="gap-2 text-black">
              <Home className="h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
          <Link href="/produtos">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Ver Produtos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
