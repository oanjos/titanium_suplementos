import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Buscar pedido por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        discountCode: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedido' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar status do pedido
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { status } = await request.json();

    const validStatuses = [
      'pending',
      'paid',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    const orderId = parseInt(params.id);

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!existing) {
        return null;
      }

      if (existing.status === status) {
        return existing;
      }

      if (status === 'paid' && existing.status !== 'paid') {
        for (const item of existing.items) {
          const product = item.product;
          if (product.stockType === 'sem_estoque') {
            throw new Error('Produto sem estoque');
          }

          if (product.stockType === 'pronta_entrega') {
            const currentStock = product.stockAvailable ?? 0;
            if (currentStock < item.quantity) {
              throw new Error('Estoque insuficiente para baixa');
            }
            await tx.product.update({
              where: { id: product.id },
              data: {
                stockAvailable: {
                  decrement: item.quantity,
                },
              },
            });
          } else if (product.stockType === 'sob_encomenda') {
            const currentStock = product.stockDistributor ?? 0;
            if (currentStock < item.quantity) {
              throw new Error('Estoque do distribuidor insuficiente');
            }
            await tx.product.update({
              where: { id: product.id },
              data: {
                stockDistributor: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return updated;
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Pedido nÃ£o encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro ao atualizar pedido:', error);
    const message = typeof error?.message === 'string' ? error.message : '';
    if (message) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido' },
      { status: 500 }
    );
  }
}
