'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, CreditCard, Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const CHECKOUT_FORM_STORAGE_KEY = 'titanium.checkout.form';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState<any>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const cpfLookupRef = useRef<NodeJS.Timeout | null>(null);

  const subtotal = getTotal?.() ?? 0;
  const shippingCost = 0; // Frete grátis
  const discountAmount = discount?.amount ?? 0;
  const total = subtotal - discountAmount;

  // Form state
  const [formData, setFormData] = useState({
    cpf: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const normalizeCpf = (value: string) => value.replace(/\D/g, '').slice(0, 11);

  const formatCpf = (value: string) => {
    const digits = normalizeCpf(value);
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 9);
    const part4 = digits.slice(9, 11);
    if (digits.length <= 3) return part1;
    if (digits.length <= 6) return `${part1}.${part2}`;
    if (digits.length <= 9) return `${part1}.${part2}.${part3}`;
    return `${part1}.${part2}.${part3}-${part4}`;
  };

  useEffect(() => {
    const cpf = normalizeCpf(formData.cpf ?? '');
    if (cpf.length !== 11) {
      return;
    }
    if (cpfLookupRef.current) {
      clearTimeout(cpfLookupRef.current);
    }
    cpfLookupRef.current = setTimeout(async () => {
      setLoadingCustomer(true);
      try {
        const response = await fetch(`/api/clientes/${cpf}`);
        const data = await response.json();
        if (response.ok && data?.found) {
          setFormData((prev) => ({
            ...prev,
            customerName: data?.customer?.name ?? prev.customerName,
            customerEmail: data?.customer?.email ?? prev.customerEmail,
            customerPhone: data?.customer?.phone ?? prev.customerPhone,
          }));
        }
      } catch (error) {
        // ignore lookup errors
      } finally {
        setLoadingCustomer(false);
      }
    }, 350);

    return () => {
      if (cpfLookupRef.current) {
        clearTimeout(cpfLookupRef.current);
      }
    };
  }, [formData.cpf]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.sessionStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch (error) {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(
        CHECKOUT_FORM_STORAGE_KEY,
        JSON.stringify({
          cpf: formData.cpf,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
        })
      );
    } catch (error) {
      // ignore storage errors
    }
  }, [formData.cpf, formData.customerName, formData.customerEmail, formData.customerPhone]);

  const applyCoupon = async () => {
    if (!couponCode?.trim()) {
      toast.error('Digite um código de cupom');
      return;
    }

    setApplyingCoupon(true);
    try {
      const response = await fetch('/api/cupom/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode?.toUpperCase(), subtotal }),
      });

      const data = await response.json();

      if (response.ok && data?.success) {
        setDiscount(data?.discount ?? null);
        toast.success('Cupom aplicado com sucesso!');
      } else {
        toast.error(data?.error ?? 'Erro ao aplicar cupom');
      }
    } catch (error) {
      toast.error('Erro ao validar cupom');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setDiscount(null);
    setCouponCode('');
    toast.success('Cupom removido');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulário
    const requiredFields = ['cpf', 'customerName', 'customerEmail', 'customerPhone'];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]?.trim());

    if (missingFields?.length > 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (normalizeCpf(formData.cpf ?? '').length !== 11) {
      toast.error('CPF invÃ¡lido');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer: {
          cpf: normalizeCpf(formData?.cpf ?? ''),
          name: formData?.customerName ?? '',
          email: formData?.customerEmail ?? '',
          phone: formData?.customerPhone ?? '',
          address: 'Retirada na loja',
        },
        items: items?.map((item) => ({
          productId: item?.productId ?? 0,
          quantity: item?.quantity ?? 0,
          unitPrice: item?.price ?? 0,
        })) ?? [],
        subtotal,
        discountAmount,
        discountCodeId: discount?.id ?? null,
        shippingCost,
        totalAmount: total,
        paymentMethod: 'pix',
      };

      const response = await fetch('/api/pagamentos/mercadopago/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok && data?.success) {
        if (data?.initPoint) {
          window.location.href = data.initPoint;
          return;
        }
        router.push(`/confirmacao?pedido=${data?.orderNumber ?? ''}`);
      } else {
        toast.error(data?.error ?? 'Erro ao criar pedido');
      }
    } catch (error) {
      toast.error('Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  if ((items?.length ?? 0) === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Carrinho Vazio</h1>
          <p className="text-muted-foreground">Adicione produtos ao carrinho antes de finalizar a compra</p>
          <Link href="/produtos">
            <Button className="mt-4 gap-2 text-black">
              Ver Produtos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Finalizar Compra</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formatCpf(formData?.cpf ?? '')}
                    onChange={(e) =>
                      handleInputChange('cpf', normalizeCpf(e?.target?.value ?? ''))
                    }
                    placeholder="000.000.000-00"
                    required
                  />
                  {loadingCustomer && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Buscando seus dados...
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData?.customerName ?? ''}
                    onChange={(e) => handleInputChange('customerName', e?.target?.value ?? '')}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData?.customerEmail ?? ''}
                      onChange={(e) => handleInputChange('customerEmail', e?.target?.value ?? '')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={formData?.customerPhone ?? ''}
                      onChange={(e) => handleInputChange('customerPhone', e?.target?.value ?? '')}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items?.map((item) => (
                    <div key={`${item?.productId ?? 0}`} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-secondary rounded overflow-hidden">
                        <Image
                          src={item?.imageUrl ?? ''}
                          alt={item?.productName ?? ''}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-semibold line-clamp-1">{item?.productName ?? ''}</p>
                        {item?.sku && (
                          <p className="text-xs text-muted-foreground">{item?.sku}</p>
                        )}
                        <p className="text-xs">
                          {item?.quantity ?? 0}x R$ {item?.price?.toFixed(2)?.replace('.', ',') ?? '0,00'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="pt-4 border-t space-y-2">
                  <Label>Cupom de Desconto</Label>
                  {!discount ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite o cupom"
                        value={couponCode ?? ''}
                        onChange={(e) => setCouponCode(e?.target?.value?.toUpperCase() ?? '')}
                      />
                      <Button
                        type="button"
                        onClick={applyCoupon}
                        disabled={applyingCoupon}
                        className="text-black"
                      >
                        {applyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{discount?.code ?? ''}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeCoupon}
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R$ {subtotal?.toFixed(2)?.replace('.', ',') ?? '0,00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-primary font-semibold">Grátis</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Desconto</span>
                      <span>- R$ {discountAmount?.toFixed(2)?.replace('.', ',') ?? '0,00'}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">
                      R$ {total?.toFixed(2)?.replace('.', ',') ?? '0,00'}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full gap-2 text-black font-semibold"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Finalizar Pedido
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
