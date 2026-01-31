import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Listar todos os cupons
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const coupons = await prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cupons' },
      { status: 500 }
    );
  }
}

// POST - Criar novo cupom
export async function POST(request: NextRequest) {
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

    // Verificar se o código já existe
    const existingCode = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'Este código já existe' },
        { status: 400 }
      );
    }

    const coupon = await prisma.discountCode.create({
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
        active: active ?? true,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cupom:', error);
    return NextResponse.json(
      { error: 'Erro ao criar cupom' },
      { status: 500 }
    );
  }
}
