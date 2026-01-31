import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = body ?? {};

    if (!code || !subtotal) {
      return NextResponse.json(
        { error: 'Código e subtotal são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar cupom
    const discountCode = await prisma.discountCode.findUnique({
      where: { code: code?.toUpperCase() ?? '' },
    });

    if (!discountCode) {
      return NextResponse.json(
        { error: 'Cupom inválido' },
        { status: 404 }
      );
    }

    // Validar se está ativo
    if (!discountCode?.active) {
      return NextResponse.json(
        { error: 'Este cupom não está mais ativo' },
        { status: 400 }
      );
    }

    // Validar validade
    const now = new Date();
    const validFrom = discountCode?.validFrom ?? new Date();
    const validUntil = discountCode?.validUntil ?? new Date();

    if (now < validFrom || now > validUntil) {
      return NextResponse.json(
        { error: 'Este cupom não está dentro do período de validade' },
        { status: 400 }
      );
    }

    // Validar limite de uso
    const usesCount = discountCode?.usesCount ?? 0;
    const maxUses = discountCode?.maxUses ?? null;
    const unlimitedUses = discountCode?.unlimitedUses ?? false;

    if (!unlimitedUses && maxUses !== null && usesCount >= maxUses) {
      return NextResponse.json(
        { error: 'Este cupom atingiu o limite de uso' },
        { status: 400 }
      );
    }

    // Validar compra mínima
    const minPurchase = Number(discountCode?.minPurchase ?? 0);
    if (subtotal < minPurchase) {
      return NextResponse.json(
        {
          error: `Compra mínima de R$ ${minPurchase?.toFixed(2)?.replace('.', ',')} necessária`,
        },
        { status: 400 }
      );
    }

    // Calcular desconto
    const discountValue = Number(discountCode?.discountValue ?? 0);
    let discountAmount = 0;

    if (discountCode?.discountType === 'percentage') {
      discountAmount = (subtotal * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }

    // Não permitir desconto maior que o subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      success: true,
      discount: {
        id: discountCode?.id ?? 0,
        code: discountCode?.code ?? '',
        type: discountCode?.discountType ?? '',
        value: discountValue,
        amount: discountAmount,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Erro ao validar cupom' },
      { status: 500 }
    );
  }
}
