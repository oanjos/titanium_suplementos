'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, Clock, Minus, Plus, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((state) => state?.addItem);

  const isInStock = product?.stockType === 'pronta_entrega';
  const isOutOfStock = product?.stockType === 'sem_estoque';
  const totalPrice = Number(product?.price ?? 0);
  const availableStock = isInStock
    ? (product?.stockAvailable ?? 0)
    : (product?.stockDistributor ?? 0);

  const handleAddToCart = () => {
    addItem?.({
      productId: product?.id ?? 0,
      quantity,
      productName: product?.name ?? '',
      imageUrl: product?.imageUrl ?? '',
      price: totalPrice,
      brand: product?.brand ?? '',
      sku: product?.sku ?? null,
    });
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/produtos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar para produtos
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <div className="relative aspect-square bg-secondary/50">
              <Image
                src={product?.imageUrl ?? ''}
                alt={product?.name ?? 'Produto'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute top-4 right-4">
                <Badge
                  variant={isInStock ? 'success' : isOutOfStock ? 'destructive' : 'warning'}
                  className="gap-1 text-sm px-3 py-1"
                >
                  {isInStock ? (
                    <>
                      <Package className="h-4 w-4" />
                      Pronta Entrega
                    </>
                  ) : isOutOfStock ? (
                    <>
                      <Package className="h-4 w-4" />
                      Sem Estoque
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4" />
                      Sob Encomenda (2 dias ?teis)
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Brand & Category */}
          <div className="space-y-1">
            <p className="text-sm text-primary font-semibold uppercase tracking-wide">
              {product?.brand ?? ''}
            </p>
            <p className="text-xs text-muted-foreground uppercase">{product?.category ?? ''}</p>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold">{product?.name ?? ''}</h1>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{product?.description ?? ''}</p>

          {/* Price */}
          <Card className="bg-secondary/50">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Preço</p>
              <p className="text-4xl font-bold text-primary">
                R$ {totalPrice?.toFixed(2)?.replace('.', ',') ?? '0,00'}
              </p>
            </CardContent>
          </Card>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Quantidade:</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={incrementQuantity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {availableStock} unidades disponíveis
              </p>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full gap-2 text-black font-semibold"
            onClick={handleAddToCart}
            disabled={availableStock <= 0}
          >
            <ShoppingCart className="h-5 w-5" />
            Adicionar ao Carrinho
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/produtos');
              }
            }}
          >
            Continuar comprando
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
