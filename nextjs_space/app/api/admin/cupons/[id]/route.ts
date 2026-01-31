import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PUT - Atualizar cupom
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const {
      code,
      partnerName,
      discountType,
      discountValue,
      minPurchase,
      maxUses,
      unlimitedUses,
      validFrom,
      validUntil,
      active,
    } = data;

    // Verificar se o código já existe em outro cupom
    const existingCode = await prisma.discountCode.findFirst({
      where: {
        code: code.toUpperCase(),
        NOT: { id: parseInt(params.id) },
      },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'Este código já existe' },
        { status: 400 }
      );
    }

    const coupon = await prisma.discountCode.update({
      where: { id: parseInt(params.id) },
      data: {
        code: code.toUpperCase(),
        partnerName: partnerName || null,
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: parseFloat(minPurchase || 0),
        maxUses: unlimitedUses ? null : parseInt(maxUses || 0),
        unlimitedUses: !!unlimitedUses,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        active,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Erro ao atualizar cupom:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar cupom' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir cupom
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await prisma.discountCode.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir cupom:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir cupom' },
      { status: 500 }
    );
  }
}
