'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, CreditCard, Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState<any>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subtotal = getTotal?.() ?? 0;
  const shippingCost = 0; // Frete grátis
  const discountAmount = discount?.amount ?? 0;
  const total = subtotal - discountAmount;

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    paymentMethod: 'pix',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'cep', 'address', 'number', 'neighborhood', 'city', 'state'];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]?.trim());

    if (missingFields?.length > 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer: {
          name: formData?.customerName ?? '',
          email: formData?.customerEmail ?? '',
          phone: formData?.customerPhone ?? '',
          address: `${formData?.address ?? ''}, ${formData?.number ?? ''}, ${formData?.complement ?? ''}, ${formData?.neighborhood ?? ''}, ${formData?.city ?? ''} - ${formData?.state ?? ''}, CEP: ${formData?.cep ?? ''}`,
        },
        items: items?.map((item) => ({
          productId: item?.productId ?? 0,
          variantId: item?.variantId ?? 0,
          quantity: item?.quantity ?? 0,
          unitPrice: item?.price ?? 0,
        })) ?? [],
        subtotal,
        discountAmount,
        discountCodeId: discount?.id ?? null,
        shippingCost,
        totalAmount: total,
        paymentMethod: formData?.paymentMethod ?? 'pix',
      };

      const response = await fetch('/api/pedidos/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok && data?.success) {
        clearCart?.();
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

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      value={formData?.cep ?? ''}
                      onChange={(e) => handleInputChange('cep', e?.target?.value ?? '')}
                      placeholder="00000-000"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Endereço *</Label>
                    <Input
                      id="address"
                      value={formData?.address ?? ''}
                      onChange={(e) => handleInputChange('address', e?.target?.value ?? '')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={formData?.number ?? ''}
                      onChange={(e) => handleInputChange('number', e?.target?.value ?? '')}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData?.complement ?? ''}
                    onChange={(e) => handleInputChange('complement', e?.target?.value ?? '')}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={formData?.neighborhood ?? ''}
                      onChange={(e) => handleInputChange('neighborhood', e?.target?.value ?? '')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={formData?.city ?? ''}
                      onChange={(e) => handleInputChange('city', e?.target?.value ?? '')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      value={formData?.state ?? ''}
                      onChange={(e) => handleInputChange('state', e?.target?.value ?? '')}
                      placeholder="SP"
                      maxLength={2}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle>Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData?.paymentMethod ?? 'pix'}
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  </SelectContent>
                </Select>
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
                    <div key={`${item?.productId ?? 0}-${item?.variantId ?? 0}`} className="flex gap-3">
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
                        <p className="text-xs text-muted-foreground">{item?.variantName ?? ''}</p>
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
