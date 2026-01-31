'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Ticket,
  Clock,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: number;
  orderNumber: string;
  customerCpf?: string | null;
  totalAmount: number;
  status: string;
  customerProfile?: {
    name: string;
  } | null;
}

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  activeCoupons: number;
  recentOrders: Order[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  paid: 'bg-blue-500/10 text-blue-500',
  processing: 'bg-purple-500/10 text-purple-500',
  shipped: 'bg-cyan-500/10 text-cyan-500',
  delivered: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-500',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  processing: 'Processando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, productsRes, cuponsRes] = await Promise.all([
          fetch('/api/admin/pedidos'),
          fetch('/api/admin/produtos'),
          fetch('/api/admin/cupons'),
        ]);

        const orders = await ordersRes.json();
        const products = await productsRes.json();
        const coupons = await cuponsRes.json();

        const totalRevenue = Array.isArray(orders)
          ? orders.reduce((acc: number, order: Order) => acc + Number(order.totalAmount), 0)
          : 0;

        const totalOrders = Array.isArray(orders) ? orders.length : 0;
        const pendingOrders = Array.isArray(orders)
          ? orders.filter((o: Order) => o.status === 'pending').length
          : 0;
        const totalProducts = Array.isArray(products) ? products.length : 0;
        const lowStockProducts = Array.isArray(products)
          ? products.filter((p: { stockAvailable?: number | null }) =>
              (p.stockAvailable ?? 0) < 10
            ).length
          : 0;
        const activeCoupons = Array.isArray(coupons)
          ? coupons.filter((c: { active: boolean }) => c.active).length
          : 0;

        setData({
          totalRevenue,
          totalOrders,
          pendingOrders,
          totalProducts,
          lowStockProducts,
          activeCoupons,
          recentOrders: Array.isArray(orders) ? orders.slice(0, 5) : [],
        });
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#00ff41]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-zinc-400 py-12">
        Erro ao carregar dados do dashboard
      </div>
    );
  }

  const stats = [
    {
      title: 'Receita Total',
      value: `R$ ${data.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total de Pedidos',
      value: data.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      subtitle: `${data.pendingOrders} pendentes`,
    },
    {
      title: 'Produtos',
      value: data.totalProducts,
      icon: Package,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      subtitle: data.lowStockProducts > 0 ? `${data.lowStockProducts} com baixo estoque` : undefined,
    },
    {
      title: 'Cupons Ativos',
      value: data.activeCoupons,
      icon: Ticket,
      color: 'text-[#00ff41]',
      bgColor: 'bg-[#00ff41]/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400">Visão geral do seu negócio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                {stat.subtitle && (
                  <p className="text-xs text-zinc-500 mt-1">{stat.subtitle}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#00ff41]" />
            Pedidos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentOrders.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">
              Nenhum pedido realizado ainda
            </p>
          ) : (
            <div className="space-y-4">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-white">{order.orderNumber}</p>
                    <p className="text-sm text-zinc-400">
                      {order.customerProfile?.name ?? order.customerCpf ?? 'Cliente'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#00ff41]">
                      R$ {Number(order.totalAmount).toFixed(2)}
                    </p>
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
