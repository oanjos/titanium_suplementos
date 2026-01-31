import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, ShieldCheck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import prisma from '@/lib/db';
import ProductCard from '@/components/product-card';

export const dynamic = 'force-dynamic';

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        stockType: 'pronta_entrega',
        costPrice: { not: null },
        stockAvailable: {
          gt: 0,
        },
      },
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Convert Decimal to number for client components
    return products?.map((product: any) => ({
      ...product,
      price: Number(product?.price ?? 0),
    })) ?? [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

const categories = [
  { name: 'WHEY PROTEIN', value: 'WHEY PROTEIN', icon: Package },
  { name: 'CREATINA', value: 'CREATINA', icon: Zap },
  { name: 'VITAMINAS', value: 'VITAMINAS', icon: Package },
  { name: 'PROTEINAS', value: 'PROTEINAS', icon: Package },
  { name: 'MINERAIS', value: 'MINERAIS', icon: Package },
  { name: 'OMEGA 3', value: 'OMEGA 3', icon: Package },
  { name: 'COLAGENO', value: 'COLAGENO', icon: Package },
  { name: 'DOCE FIT', value: 'DOCE FIT', icon: Package },
];

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black py-12 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
        <div className="container relative mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center text-center space-y-6 -mt-4 md:-mt-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1">
              <Zap className="mr-2 h-4 w-4" fill="currentColor" />
              Suplementos Premium
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Potencialize seus <span className="text-gradient">resultados</span>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Suplementos de alta qualidade para atletas e entusiastas do fitness que buscam performance e resultados reais
            </p>
            <div className="pt-4" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-3xl md:text-4xl font-bold">Categorias</h2>
            <p className="text-muted-foreground">Encontre o suplemento perfeito para seus objetivos</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories?.map((category) => {
              const Icon = category?.icon;
              return (
                <Link
                  key={category?.value ?? ''}
                  href={`/produtos?categoria=${encodeURIComponent(category?.value ?? '')}`}
                  className="group"
                >
                  <Card className="p-6 text-center hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        {Icon && <Icon className="h-6 w-6 text-primary" />}
                      </div>
                      <h3 className="font-semibold text-sm">{category?.name ?? ''}</h3>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Qualidade Garantida</h3>
                <p className="text-sm text-muted-foreground">Produtos originais e certificados</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Resultados Reais</h3>
                <p className="text-sm text-muted-foreground">Performance comprovada</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Produtos em Destaque</h2>
            </div>
            <Link href="/produtos">
              <Button variant="outline" className="gap-2">
                Ver Todos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts?.map((product: any) => (
              <ProductCard key={product?.id ?? 0} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
