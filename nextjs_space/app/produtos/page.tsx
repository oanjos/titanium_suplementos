import prisma from '@/lib/db';
import ProductCard from '@/components/product-card';
import ProductsFilter from '@/components/products-filter';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getProducts(category?: string, search?: string) {
  try {
    const searchValue = search?.trim();
    const andConditions: any[] = [];
    if (category) {
      andConditions.push({
        category: {
          equals: category,
          mode: 'insensitive' as const,
        },
      });
    }
    if (searchValue) {
      andConditions.push({
        OR: [
          { name: { contains: searchValue, mode: 'insensitive' as const } },
          {
            aliasName: {
              contains: searchValue,
              mode: 'insensitive' as const,
            },
          },
        ],
      });
    }
    andConditions.push(
      category
        ? {
            OR: [
              { stockType: 'pronta_entrega', stockAvailable: { gt: 0 } },
              { stockType: 'sob_encomenda', stockDistributor: { gt: 0 } },
            ],
          }
        : {
            stockType: 'pronta_entrega',
            stockAvailable: { gt: 0 },
          }
    );

    const where = {
      costPrice: { not: null },
      AND: andConditions,
    };

    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { stockType: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    
    // Convert Decimal to number for client components
    return products?.map((product: any) => ({
      ...product,
      price: Number(product?.price ?? 0),
    })) ?? [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const categories = await prisma.product.findMany({
      where: {
        costPrice: { not: null },
        OR: [
          { stockType: 'pronta_entrega', stockAvailable: { gt: 0 } },
          { stockType: 'sob_encomenda', stockDistributor: { gt: 0 } },
        ],
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });
    return categories?.map((c: any) => c?.category ?? '')?.filter(Boolean) ?? [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function getProductNames(category?: string) {
  try {
    const where = {
      costPrice: { not: null },
      NOT: {
        stockType: 'sem_estoque' as const,
      },
      ...(category
        ? {
            category: {
              equals: category,
              mode: 'insensitive' as const,
            },
          }
        : {}),
    };

    const names = await prisma.product.findMany({
      where,
      select: { name: true },
      distinct: ['name'],
      orderBy: { name: 'asc' },
    });

    return names?.map((item) => item?.name ?? '').filter(Boolean) ?? [];
  } catch (error) {
    console.error('Error fetching product names:', error);
    return [];
  }
}

export default async function ProdutosPage({ searchParams }: PageProps) {
  const categoria = searchParams?.categoria as string | undefined;
  const busca =
    typeof searchParams?.busca === 'string' ? searchParams?.busca : undefined;
  const products = await getProducts(categoria, busca);
  const categories = await getCategories();
  const productNames = await getProductNames(categoria);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            {categoria ? categoria : 'Produtos em Pronta Entrega'}
          </h1>
          <p className="text-muted-foreground">
            {products?.length ?? 0} produto{(products?.length ?? 0) !== 1 ? 's' : ''} encontrado{(products?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter */}
        <ProductsFilter
          categories={categories}
          selectedCategory={categoria}
          productNames={productNames}
        />

        {/* Products Grid */}
        {(products?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map((product: any, index: number) => (
              <ProductCard key={product?.id ?? 0} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <p className="text-xl text-muted-foreground">Nenhum produto encontrado</p>
            <p className="text-sm text-muted-foreground">Tente ajustar os filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}
