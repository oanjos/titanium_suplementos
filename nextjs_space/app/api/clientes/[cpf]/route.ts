import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { cpf: string } }
) {
  try {
    const cpf = String(params?.cpf ?? '').replace(/\D/g, '');
    if (!cpf) {
      return NextResponse.json({ found: false });
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { cpf },
    });

    if (!customer) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      customer: {
        cpf: customer.cpf,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return NextResponse.json(
      { found: false, error: 'Erro ao buscar cliente' },
      { status: 500 }
    );
  }
}
