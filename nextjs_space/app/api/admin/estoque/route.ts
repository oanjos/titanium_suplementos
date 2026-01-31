import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Atualizar estoque de pronta entrega
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const {
      productId,
      stockQuantity,
      costPrice,
      marginPercentage,
      imageUrl,
    } = data ?? {};

    if (!productId) {
      return NextResponse.json(
        { error: 'Produto é obrigatório' },
        { status: 400 }
      );
    }

    const parsedCost =
      costPrice === null || costPrice === undefined || costPrice === ''
        ? null
        : parseFloat(String(costPrice));
    const parsedMargin =
      marginPercentage === null || marginPercentage === undefined || marginPercentage === ''
        ? null
        : parseFloat(String(marginPercentage));

    if (parsedCost === null || parsedMargin === null) {
      return NextResponse.json(
        { error: 'Custo e margem são obrigatórios' },
        { status: 400 }
      );
    }

    const calculatedPrice =
      parsedCost * (1 + parsedMargin / 100);

    await prisma.product.update({
      where: { id: parseInt(String(productId)) },
      data: {
        costPrice: parsedCost,
        marginPercentage: parsedMargin,
        price: calculatedPrice,
        stockType: 'pronta_entrega',
        stockAvailable: parseInt(String(stockQuantity || 0)),
        ...(imageUrl ? { imageUrl: String(imageUrl) } : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar estoque' },
      { status: 500 }
    );
  }
}
