import prisma from '@/lib/db';
import ProductCard from '@/components/product-card';
import ProductsFilter from '@/components/products-filter';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getProducts(category?: string) {
  try {
    const where = category
      ? {
          category: {
            equals: category,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Convert Decimal to number for client components
    return products?.map((product: any) => ({
      ...product,
      price: Number(product?.price ?? 0),
      variants: product?.variants?.map((variant: any) => ({
        ...variant,
        additionalPrice: Number(variant?.additionalPrice ?? 0),
      })) ?? [],
    })) ?? [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const categories = await prisma.product.findMany({
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

export default async function ProdutosPage({ searchParams }: PageProps) {
  const categoria = searchParams?.categoria as string | undefined;
  const products = await getProducts(categoria);
  const categories = await getCategories();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            {categoria ? categoria : 'Todos os Produtos'}
          </h1>
          <p className="text-muted-foreground">
            {products?.length ?? 0} produto{(products?.length ?? 0) !== 1 ? 's' : ''} encontrado{(products?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter */}
        <ProductsFilter categories={categories} selectedCategory={categoria} />

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
