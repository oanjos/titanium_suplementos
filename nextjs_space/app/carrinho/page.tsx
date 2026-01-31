'use client';

import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CarrinhoPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCart();
  const total = getTotal?.() ?? 0;

  if ((items?.length ?? 0) === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground">Adicione produtos para começar suas compras</p>
          <Link href="/produtos">
            <Button className="mt-4 gap-2 text-black">
              Ver Produtos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Carrinho de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items?.map((item) => (
            <Card key={`${item?.productId ?? 0}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-secondary rounded-lg overflow-hidden">
                    <Image
                      src={item?.imageUrl ?? ''}
                      alt={item?.productName ?? 'Produto'}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-xs text-primary font-semibold uppercase">
                        {item?.brand ?? ''}
                      </p>
                      <h3 className="font-semibold">{item?.productName ?? ''}</h3>
                      {item?.sku && (
                        <p className="text-sm text-muted-foreground">{item?.sku}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity?.(
                              item?.productId ?? 0,
                              (item?.quantity ?? 1) - 1
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center text-sm font-semibold">
                          {item?.quantity ?? 0}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity?.(
                              item?.productId ?? 0,
                              (item?.quantity ?? 0) + 1
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">
                          R$ {((item?.price ?? 0) * (item?.quantity ?? 0))?.toFixed(2)?.replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => removeItem?.(item?.productId ?? 0)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Resumo do Pedido</h2>

              <div className="space-y-2 py-4 border-y">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">
                    R$ {total?.toFixed(2)?.replace('.', ',') ?? '0,00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="font-semibold text-primary">Grátis</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  R$ {total?.toFixed(2)?.replace('.', ',') ?? '0,00'}
                </span>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full gap-2 text-black font-semibold" size="lg">
                  Finalizar Compra
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/produtos" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  Continuar Comprando
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
