import Link from 'next/link';
import { Zap, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Zap className="h-6 w-6 text-black" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight">TITANIUM</span>
                <span className="text-xs text-muted-foreground -mt-1">SUPLEMENTOS</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Sua loja de suplementos premium. Qualidade e resultado garantidos.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/rastrear-pedido"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Rastrear Pedido
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                contato@titaniumsuplementos.com
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                São Paulo, Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Titanium Suplementos. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
