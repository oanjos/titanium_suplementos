import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export const dynamic = 'force-dynamic';

function validateSignature(request: NextRequest, dataId: string) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;

  const signature = request.headers.get('x-signature') ?? '';
  const requestId = request.headers.get('x-request-id') ?? '';

  const parts = Object.fromEntries(
    signature
      .split(',')
      .map((part) => part.split('=').map((v) => v.trim()))
      .filter((pair) => pair.length === 2)
  );

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1 || !requestId) {
    return false;
  }

  const template = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const computed = crypto
    .createHmac('sha256', secret)
    .update(template)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(computed, 'hex'),
    Buffer.from(v1, 'hex')
  );
}

function mapPaymentStatus(status: string) {
  const normalized = String(status ?? '').toLowerCase();
  if (normalized === 'approved') return 'paid';
  if (['pending', 'in_process', 'in_mediation'].includes(normalized)) return 'pending';
  if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(normalized)) {
    return 'cancelled';
  }
  return 'pending';
}

function mapPaymentMethod(payment: any) {
  const paymentType = String(payment?.payment_type_id ?? '').toLowerCase();
  const methodId = String(payment?.payment_method_id ?? '').toLowerCase();
  if (paymentType === 'credit_card') return 'credit_card';
  if (paymentType === 'debit_card') return 'debit_card';
  if (paymentType === 'pix' || methodId === 'pix') return 'pix';
  if (paymentType === 'bank_transfer') return 'pix';
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const body = await request.json().catch(() => ({}));
    const dataId =
      searchParams.get('data.id') ||
      searchParams.get('id') ||
      body?.data?.id ||
      body?.id ||
      '';

    if (!dataId) {
      return NextResponse.json({ ok: true });
    }

    const signatureOk = validateSignature(request, String(dataId));
    if (!signatureOk) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: String(dataId) });

    const orderNumber = payment?.external_reference;
    if (!orderNumber) {
      return NextResponse.json({ ok: true });
    }

    const newStatus = mapPaymentStatus(String(payment?.status ?? ''));
    const paymentMethod = mapPaymentMethod(payment);

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) return;
      if (order.status === newStatus) return;

      if (newStatus === 'paid' && order.status !== 'paid') {
        for (const item of order.items) {
          const product = item.product;
          if (product.stockType === 'sem_estoque') {
            throw new Error('Produto sem estoque');
          }

          if (product.stockType === 'pronta_entrega') {
            const currentStock = product.stockAvailable ?? 0;
            if (currentStock < item.quantity) {
              throw new Error('Estoque insuficiente para baixa');
            }
            await tx.product.update({
              where: { id: product.id },
              data: {
                stockAvailable: { decrement: item.quantity },
              },
            });
          } else if (product.stockType === 'sob_encomenda') {
            const currentStock = product.stockDistributor ?? 0;
            if (currentStock < item.quantity) {
              throw new Error('Estoque do distribuidor insuficiente');
            }
            await tx.product.update({
              where: { id: product.id },
              data: {
                stockDistributor: { decrement: item.quantity },
              },
            });
          }
        }
      }

      await tx.order.update({
        where: { orderNumber },
        data: {
          status: newStatus,
          ...(paymentMethod ? { paymentMethod } : {}),
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro webhook Mercado Pago:', error);
    return NextResponse.json({ ok: true });
  }
}
