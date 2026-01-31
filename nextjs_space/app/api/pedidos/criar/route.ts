import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TIT-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer,
      items,
      subtotal,
      discountAmount,
      discountCodeId,
      shippingCost,
      totalAmount,
      paymentMethod,
    } = body ?? {};

    // Validar dados
    if (!customer || !items || items?.length === 0) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Gerar número do pedido
    const cpf = String(customer?.cpf ?? '').replace(/\D/g, '');
    const orderNumber = generateOrderNumber();

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerCpf: cpf || null,
        subtotal,
        discountAmount: discountAmount ?? 0,
        shippingCost,
        totalAmount,
        paymentMethod,
        status: 'pending',
        discountCodeId: discountCodeId ?? null,
        items: {
          create: items?.map((item: any) => ({
            productId: item?.productId ?? 0,
            quantity: item?.quantity ?? 0,
            unitPrice: item?.unitPrice ?? 0,
            subtotal: (item?.quantity ?? 0) * (item?.unitPrice ?? 0),
          })) ?? [],
        },
      },
    });

    if (cpf) {
      await prisma.customerProfile.upsert({
        where: { cpf },
        create: {
          cpf,
          name: customer?.name ?? '',
          email: customer?.email ?? '',
          phone: customer?.phone ?? '',
        },
        update: {
          name: customer?.name ?? '',
          email: customer?.email ?? '',
          phone: customer?.phone ?? '',
        },
      });
    }

    // Se usou cupom, incrementar contador
    if (discountCodeId) {
      await prisma.discountCode.update({
        where: { id: discountCodeId },
        data: {
          usesCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderNumber: order?.orderNumber ?? '',
      orderId: order?.id ?? 0,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Erro ao criar pedido' },
      { status: 500 }
    );
  }
}
