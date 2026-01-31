import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export const dynamic = 'force-dynamic';

function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TIT-${timestamp}-${random}`;
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000'
  );
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Mercado Pago nÃ£o configurado' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      customer,
      items,
      subtotal,
      discountAmount,
      discountCodeId,
      shippingCost,
      totalAmount,
      paymentMethod,
    } = body ?? {};

    if (!customer || !items || items?.length === 0) {
      return NextResponse.json({ error: 'Dados invÃ¡lidos' }, { status: 400 });
    }

    const cpf = String(customer?.cpf ?? '').replace(/\D/g, '');
    const orderNumber = generateOrderNumber();

    if (cpf) {
      await prisma.customerProfile.upsert({
        where: { cpf },
        create: {
          cpf,
          name: customer?.name ?? '',
          email: customer?.email ?? '',
          phone: customer?.phone ?? '',
        },
        update: {
          name: customer?.name ?? '',
          email: customer?.email ?? '',
          phone: customer?.phone ?? '',
        },
      });
    }
 
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerCpf: cpf || null,
        subtotal,
        discountAmount: discountAmount ?? 0,
        shippingCost,
        totalAmount,
        paymentMethod: paymentMethod ?? 'pix',
        status: 'pending',
        discountCodeId: discountCodeId ?? null,
        items: {
          create: items?.map((item: any) => ({
            productId: item?.productId ?? 0,
            quantity: item?.quantity ?? 0,
            unitPrice: item?.unitPrice ?? 0,
            subtotal: (item?.quantity ?? 0) * (item?.unitPrice ?? 0),
          })) ?? [],
        },
      },
    });

    const baseUrl = getBaseUrl();
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const mpData = await preference.create({
      body: {
        items: items.map((item: any) => ({
          id: String(item?.productId ?? ''),
          title: item?.title ?? item?.productName ?? 'Produto',
          quantity: Number(item?.quantity ?? 1),
          unit_price: Number(item?.unitPrice ?? 0),
          currency_id: 'BRL',
        })),
        external_reference: order.orderNumber,
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${baseUrl}/confirmacao?pedido=${order.orderNumber}`,
          pending: `${baseUrl}/confirmacao?pedido=${order.orderNumber}`,
          failure: `${baseUrl}/checkout?erro=pagamento`,
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [
            { id: 'ticket' },
            { id: 'atm' },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      preferenceId: mpData?.id ?? null,
      initPoint: mpData?.init_point ?? mpData?.sandbox_init_point ?? null,
    });
  } catch (error) {
    console.error('Erro ao iniciar pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao iniciar pagamento' },
      { status: 500 }
    );
  }
}
