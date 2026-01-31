'use client';

import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: {
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  customerCpf?: string | null;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  customerProfile?: {
    cpf: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  discountCode: {
    code: string;
  } | null;
}

const statusOptions = [
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500' },
  { value: 'paid', label: 'Pago', color: 'bg-blue-500/10 text-blue-500' },
  { value: 'processing', label: 'Processando', color: 'bg-purple-500/10 text-purple-500' },
  { value: 'shipped', label: 'Enviado', color: 'bg-cyan-500/10 text-cyan-500' },
  { value: 'delivered', label: 'Entregue', color: 'bg-green-500/10 text-green-500' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-500/10 text-red-500' },
];

const paymentMethodLabels: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/pedidos');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/pedidos/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success('Status atualizado com sucesso');
        setOrders(
          orders.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          )
        );
      } else {
        toast.error('Erro ao atualizar status');
      }
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0];
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#00ff41]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos</h1>
          <p className="text-zinc-400">Gerencie os pedidos da loja</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all" className="text-white">
              Todos os Status
            </SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value} className="text-white">
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-12 w-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400">
                {filterStatus === 'all'
                  ? 'Nenhum pedido realizado ainda'
                  : 'Nenhum pedido com este status'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const isExpanded = expandedOrder === order.id;

            return (
              <Card key={order.id} className="bg-zinc-900 border-zinc-800">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <CardTitle className="text-white text-lg">
                          {order.orderNumber}
                        </CardTitle>
                        <p className="text-sm text-zinc-400">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#00ff41]">
                          R$ {Number(order.totalAmount).toFixed(2)}
                        </p>
                        <p className="text-sm text-zinc-400">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateStatus(order.id, value)}
                      >
                        <SelectTrigger
                          className={`w-[140px] border-0 ${statusInfo.color}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {statusOptions.map((status) => (
                            <SelectItem
                              key={status.value}
                              value={status.value}
                              className="text-white"
                            >
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-zinc-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-zinc-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="border-t border-zinc-800 pt-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Dados do Cliente */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-white">Dados do Cliente</h4>
                        <div className="space-y-2 text-sm">
                          {order.customerProfile?.name && (
                            <div className="flex items-center gap-2 text-zinc-400">
                              <User className="h-4 w-4" />
                              <span>{order.customerProfile.name}</span>
                            </div>
                          )}
                          {order.customerProfile?.email && (
                            <div className="flex items-center gap-2 text-zinc-400">
                              <Mail className="h-4 w-4" />
                              <span>{order.customerProfile.email}</span>
                            </div>
                          )}
                          {order.customerProfile?.phone && (
                            <div className="flex items-center gap-2 text-zinc-400">
                              <Phone className="h-4 w-4" />
                              <span>{order.customerProfile.phone}</span>
                            </div>
                          )}
                          {order.customerCpf && (
                            <div className="flex items-start gap-2 text-zinc-400">
                              <MapPin className="h-4 w-4 mt-0.5" />
                              <span>CPF: {order.customerCpf}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pagamento */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-white">Pagamento</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <CreditCard className="h-4 w-4" />
                            <span>{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span>
                          </div>
                          {order.discountCode && (
                            <div className="flex items-center gap-2 text-zinc-400">
                              <Ticket className="h-4 w-4" />
                              <span>Cupom: {order.discountCode.code}</span>
                            </div>
                          )}
                          <div className="pt-2 border-t border-zinc-800 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Subtotal</span>
                              <span className="text-zinc-300">
                                R$ {Number(order.subtotal).toFixed(2)}
                              </span>
                            </div>
                            {Number(order.discountAmount) > 0 && (
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Desconto</span>
                                <span className="text-green-500">
                                  - R$ {Number(order.discountAmount).toFixed(2)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Frete</span>
                              <span className="text-zinc-300">
                                {Number(order.shippingCost) === 0
                                  ? 'Grátis'
                                  : `R$ ${Number(order.shippingCost).toFixed(2)}`}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold pt-1">
                              <span className="text-white">Total</span>
                              <span className="text-[#00ff41]">
                                R$ {Number(order.totalAmount).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Itens do Pedido */}
                    <div className="mt-6 pt-6 border-t border-zinc-800">
                      <h4 className="font-medium text-white mb-4">Itens do Pedido</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-lg"
                          >
                            <div className="w-12 h-12 bg-zinc-700 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">
                                {item.product.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-white">
                                {item.quantity}x R$ {Number(item.unitPrice).toFixed(2)}
                              </p>
                              <p className="text-sm text-[#00ff41]">
                                R$ {Number(item.subtotal).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
