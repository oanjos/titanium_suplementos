'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Clock } from 'lucide-react';
import { Product } from '@/lib/types';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const price = Number(product?.price ?? 0);
  const isInStock = product?.stockType === 'pronta_entrega';
  const isOutOfStock = product?.stockType === 'sem_estoque';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link href={`/produtos/${product?.id ?? 0}`}>
        <Card className="group overflow-hidden hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
          <div className="relative aspect-square bg-secondary/50">
            <Image
              src={product?.imageUrl ?? ''}
              alt={product?.name ?? 'Produto'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-3 right-3">
              <Badge
                variant={isInStock ? 'success' : isOutOfStock ? 'destructive' : 'warning'}
                className="gap-1"
              >
                {isInStock ? (
                  <>
                    <Package className="h-3 w-3" />
                    Pronta Entrega
                  </>
                ) : isOutOfStock ? (
                  <>
                    <Package className="h-3 w-3" />
                    Sem Estoque
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    Sob Encomenda
                  </>
                )}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-xs text-primary font-semibold uppercase tracking-wide">
                {product?.brand ?? ''}
              </p>
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {product?.name ?? ''}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product?.category ?? ''}
              </p>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">A partir de</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {price?.toFixed(2)?.replace('.', ',') ?? '0,00'}
                  </p>
                </div>
                <Button size="icon" className="rounded-full text-black">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
