import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Buscar produto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar produto
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

    const product = await prisma.product.update({
      where: { id: parseInt(params.id) },
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
            ? undefined
            : parseInt(String(stockAvailable)),
        stockDistributor:
          stockDistributor === undefined || stockDistributor === null
            ? undefined
            : parseInt(String(stockDistributor)),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir produto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await prisma.product.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir produto' },
      { status: 500 }
    );
  }
}
