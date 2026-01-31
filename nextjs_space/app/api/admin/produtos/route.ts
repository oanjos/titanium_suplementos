import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Listar todos os produtos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const needsAttentionParam = searchParams.get('needsAttention');
    const countOnly = searchParams.get('countOnly') === 'true';
    const where =
      needsAttentionParam === null
        ? {}
        : needsAttentionParam === 'true'
          ? { costPrice: null }
          : { costPrice: { not: null } };

    if (countOnly) {
      const count = await prisma.product.count({ where });
      return NextResponse.json({ count });
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const {
      name,
      description,
      category,
      brand,
      costPrice,
      marginPercentage,
      price,
      imageUrl,
      supplierUrl,
      sku,
      groupCode,
      stockAvailable,
      stockDistributor,
      stockType,
    } = data;

    // Calcular preço se custo e margem foram fornecidos
    let finalPrice = price ?? 0;
    if (costPrice !== null && costPrice !== undefined && marginPercentage !== null && marginPercentage !== undefined) {
      finalPrice = costPrice * (1 + marginPercentage / 100);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        brand,
        groupCode: groupCode || null,
        sku: sku || null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        marginPercentage: marginPercentage ? parseFloat(marginPercentage) : null,
        price: parseFloat(String(finalPrice || 0)),
        imageUrl,
        supplierUrl: supplierUrl || null,
        stockType,
        stockAvailable:
          stockAvailable === undefined || stockAvailable === null
            ? 0
            : parseInt(String(stockAvailable)),
        stockDistributor:
          stockDistributor === undefined || stockDistributor === null
            ? 0
            : parseInt(String(stockDistributor)),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    );
  }
}
