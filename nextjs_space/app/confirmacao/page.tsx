'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, Home } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function ConfirmacaoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams?.get('pedido') ?? '';
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) {
      router.push('/');
      return;
    }

    // Buscar detalhes do pedido
    fetch(`/api/pedidos/buscar?numero=${orderNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setOrder(data?.order ?? null);
        }
      })
      .catch((error) => {
        console.error('Error fetching order:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderNumber, router]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <div className="text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <div className="text-center space-y-4">
          <p className="text-xl">Pedido não encontrado</p>
          <Link href="/">
            <Button>Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  const total = Number(order?.totalAmount ?? 0);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Success Message */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Pedido Confirmado!</h1>
          <p className="text-muted-foreground text-lg">
            Seu pedido foi recebido e está sendo processado
          </p>
        </div>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Número do Pedido</p>
                <p className="font-semibold text-lg text-primary">{order?.orderNumber ?? ''}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold capitalize">
                  {order?.status === 'pending' ? 'Aguardando Pagamento' : order?.status ?? ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                <p className="font-semibold capitalize">
                  {order?.paymentMethod === 'pix' ? 'Pix' : 'Cartão de Crédito'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold text-lg text-primary">
                  R$ {total?.toFixed(2)?.replace('.', ',') ?? '0,00'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Retirada na Loja</p>
              <p className="text-sm">Retirada na loja</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Próximos Passos</p>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li>• Seu pedido está aguardando confirmação de pagamento</li>
                  <li>• Você receberá um e-mail com instruções para pagamento</li>
                  <li>• Após a confirmação, seu pedido será preparado e enviado</li>
                  <li>• Acompanhe o status do seu pedido usando o número acima</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/rastrear-pedido" className="flex-1 sm:flex-initial">
            <Button variant="outline" className="w-full gap-2">
              <Package className="h-4 w-4" />
              Rastrear Pedido
            </Button>
          </Link>
          <Link href="/" className="flex-1 sm:flex-initial">
            <Button className="w-full gap-2 text-black">
              <Home className="h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function ConfirmacaoPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-3xl px-4 py-16 text-center">Carregando...</div>}>
      <ConfirmacaoContent />
    </Suspense>
  );
}
