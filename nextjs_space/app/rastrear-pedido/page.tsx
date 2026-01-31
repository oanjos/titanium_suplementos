'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, Search, Loader2, CheckCircle2, Clock, Truck, Box } from 'lucide-react';
import { toast } from 'sonner';

export default function RastrearPedidoPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber?.trim()) {
      toast.error('Digite o número do pedido');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch(`/api/pedidos/buscar?numero=${orderNumber}`);
      const data = await response.json();

      if (response.ok && data?.success) {
        setOrder(data?.order ?? null);
      } else {
        setOrder(null);
        toast.error(data?.error ?? 'Pedido não encontrado');
      }
    } catch (error) {
      setOrder(null);
      toast.error('Erro ao buscar pedido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
            const statusMap: Record<string, { label: string; icon: any; variant: any }> = {
      pending: { label: 'Aguardando Pagamento', icon: Clock, variant: 'warning' },
      paid: { label: 'Pagamento Confirmado', icon: CheckCircle2, variant: 'success' },
      processing: { label: 'Em Preparação', icon: Box, variant: 'default' },
      shipped: { label: 'Enviado', icon: Truck, variant: 'default' },
      delivered: { label: 'Entregue', icon: CheckCircle2, variant: 'success' },
    };
    return statusMap[status] ?? { label: status, icon: Package, variant: 'default' };
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Rastrear Pedido</h1>
          <p className="text-muted-foreground">
            Digite o número do seu pedido para acompanhar o status
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Número do Pedido</Label>
                <div className="flex gap-2">
                  <Input
                    id="orderNumber"
                    placeholder="Ex: TIT-1234567890-001"
                    value={orderNumber ?? ''}
                    onChange={(e) => setOrderNumber(e?.target?.value?.toUpperCase() ?? '')}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading} className="gap-2 text-black">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Buscar
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Order Details */}
        {searched && order && (
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Status Atual</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const statusInfo = getStatusInfo(order?.status ?? '');
                      const StatusIcon = statusInfo?.icon ?? Package;
                      return (
                        <>
                          <StatusIcon className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-lg">{statusInfo?.label ?? ''}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <Badge variant={getStatusInfo(order?.status ?? '')?.variant}>
                  {order?.status?.toUpperCase() ?? ''}
                </Badge>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número do Pedido</p>
                  <p className="font-semibold">{order?.orderNumber ?? ''}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data do Pedido</p>
                  <p className="font-semibold">
                    {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold">
                    {order?.customerProfile?.name ?? 'Cliente'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-semibold text-primary">
                    R$ {Number(order?.totalAmount ?? 0)?.toFixed(2)?.replace('.', ',') ?? '0,00'}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Retirada na Loja</p>
                <p className="text-sm">Retirada na loja</p>
              </div>

              {/* Timeline */}
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-4">Histórico do Pedido</p>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-primary p-2">
                        <CheckCircle2 className="h-4 w-4 text-black" />
                      </div>
                      <div className="w-0.5 h-full bg-border mt-2" />
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold">Pedido Recebido</p>
                      <p className="text-sm text-muted-foreground">
                        {order?.createdAt ? new Date(order.createdAt).toLocaleString('pt-BR') : ''}
                      </p>
                    </div>
                  </div>

                  {order?.status !== 'pending' && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`rounded-full p-2 ${
                          ['paid', 'processing', 'shipped', 'delivered'].includes(order?.status ?? '')
                            ? 'bg-primary'
                            : 'bg-secondary'
                        }`}>
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        {order?.status !== 'paid' && <div className="w-0.5 h-full bg-border mt-2" />}
                      </div>
                      <div className="pb-4">
                        <p className="font-semibold">Pagamento Confirmado</p>
                      </div>
                    </div>
                  )}

                  {['processing', 'shipped', 'delivered'].includes(order?.status ?? '') && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`rounded-full p-2 ${
                          ['shipped', 'delivered'].includes(order?.status ?? '')
                            ? 'bg-primary'
                            : 'bg-secondary'
                        }`}>
                          <Box className="h-4 w-4" />
                        </div>
                        {order?.status !== 'processing' && <div className="w-0.5 h-full bg-border mt-2" />}
                      </div>
                      <div className="pb-4">
                        <p className="font-semibold">Em Preparação</p>
                      </div>
                    </div>
                  )}

                  {['shipped', 'delivered'].includes(order?.status ?? '') && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`rounded-full p-2 ${
                          order?.status === 'delivered' ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          <Truck className="h-4 w-4" />
                        </div>
                        {order?.status !== 'shipped' && <div className="w-0.5 h-full bg-border mt-2" />}
                      </div>
                      <div className="pb-4">
                        <p className="font-semibold">Enviado</p>
                      </div>
                    </div>
                  )}

                  {order?.status === 'delivered' && (
                    <div className="flex gap-3">
                      <div className="rounded-full bg-primary p-2">
                        <CheckCircle2 className="h-4 w-4 text-black" />
                      </div>
                      <div>
                        <p className="font-semibold">Entregue</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {searched && !order && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Pedido não encontrado</p>
              <p className="text-sm text-muted-foreground">
                Verifique se o número do pedido está correto e tente novamente
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
