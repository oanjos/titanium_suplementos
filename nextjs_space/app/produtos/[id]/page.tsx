import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import ProductDetail from '@/components/product-detail';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

async function getProduct(id: string) {
  try {
    const productId = parseInt(id);
    if (isNaN(productId)) return null;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
      },
    });
    
    if (!product) return null;
    
    // Convert Decimal to number for client components
    return {
      ...product,
      price: Number(product?.price ?? 0),
      variants: product?.variants?.map((variant: any) => ({
        ...variant,
        additionalPrice: Number(variant?.additionalPrice ?? 0),
      })) ?? [],
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params?.id ?? '');

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
