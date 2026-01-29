import { Decimal } from '@prisma/client/runtime/library';

export type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: Decimal | number;
  imageUrl: string;
  stockType: string;
  createdAt: Date;
  variants?: ProductVariant[];
};

export type ProductVariant = {
  id: number;
  productId: number;
  name: string;
  sku: string;
  additionalPrice: Decimal | number;
  stockQuantity: number;
  createdAt: Date;
};

export type CartItem = {
  productId: number;
  variantId: number;
  quantity: number;
  productName: string;
  variantName: string;
  imageUrl: string;
  price: number;
  brand: string;
};

export type DiscountCode = {
  id: number;
  code: string;
  discountType: string;
  discountValue: Decimal;
  minPurchase: Decimal;
  maxUses: number;
  usesCount: number;
  validFrom: Date;
  validUntil: Date;
  active: boolean;
};

export type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  subtotal: Decimal;
  discountAmount: Decimal;
  shippingCost: Decimal;
  totalAmount: Decimal;
  paymentMethod: string;
  status: string;
  discountCodeId?: number | null;
  createdAt: Date;
};
