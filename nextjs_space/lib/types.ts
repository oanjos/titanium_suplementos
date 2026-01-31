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
  sku?: string | null;
  groupCode?: string | null;
  stockAvailable?: number | null;
  stockDistributor?: number | null;
  createdAt: Date;
};

export type CartItem = {
  productId: number;
  quantity: number;
  productName: string;
  imageUrl: string;
  price: number;
  brand: string;
  sku?: string | null;
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
  customerCpf?: string | null;
  subtotal: Decimal;
  discountAmount: Decimal;
  shippingCost: Decimal;
  totalAmount: Decimal;
  paymentMethod: string;
  status: string;
  discountCodeId?: number | null;
  createdAt: Date;
};
