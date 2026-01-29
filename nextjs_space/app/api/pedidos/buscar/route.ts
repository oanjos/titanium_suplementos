import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderNumber = searchParams?.get('numero') ?? '';

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Número do pedido é obrigatório' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        orderNumber,
      },
      include: {
        items: {
          include: {
            product: true,
            productVariant: true,
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

    // Converter Decimal para number para JSON
    const orderData = {
      ...order,
      subtotal: Number(order?.subtotal ?? 0),
      discountAmount: Number(order?.discountAmount ?? 0),
      shippingCost: Number(order?.shippingCost ?? 0),
      totalAmount: Number(order?.totalAmount ?? 0),
      items: order?.items?.map((item: any) => ({
        ...item,
        unitPrice: Number(item?.unitPrice ?? 0),
        subtotal: Number(item?.subtotal ?? 0),
      })) ?? [],
      discountCode: order?.discountCode ? {
        ...order.discountCode,
        discountValue: Number(order?.discountCode?.discountValue ?? 0),
        minPurchase: Number(order?.discountCode?.minPurchase ?? 0),
      } : null,
    };

    return NextResponse.json({
      success: true,
      order: orderData,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedido' },
      { status: 500 }
    );
  }
}
