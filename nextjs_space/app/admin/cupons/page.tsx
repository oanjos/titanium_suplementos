'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Ticket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Coupon {
  id: number;
  code: string;
  partnerName?: string | null;
  discountType: string;
  discountValue: number;
  minPurchase: number;
  maxUses: number | null;
  unlimitedUses: boolean;
  usesCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

type CouponForm = {
  code: string;
  partnerName: string;
  discountType: string;
  discountValue: string;
  minPurchase: string;
  maxUses: string;
  unlimitedUses: boolean;
  validFrom: string;
  validUntil: string;
  active: boolean;
};

const emptyCoupon: CouponForm = {
  code: '',
  partnerName: '',
  discountType: 'percentage',
  discountValue: '',
  minPurchase: '',
  maxUses: '',
  unlimitedUses: false,
  validFrom: '',
  validUntil: '',
  active: true,
};

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponForm>(emptyCoupon);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/cupons');
      const data = await res.json();
      if (!res.ok) {
        setCoupons([]);
        return;
      }
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      partnerName: coupon.partnerName || '',
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue ?? ''),
      minPurchase: String(coupon.minPurchase ?? ''),
      maxUses: coupon.maxUses === null ? '' : String(coupon.maxUses),
      unlimitedUses: coupon.unlimitedUses ?? false,
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil.split('T')[0],
      active: coupon.active,
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingCoupon(null);
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setFormData({
      ...emptyCoupon,
      validFrom: today,
      validUntil: nextYear.toISOString().split('T')[0],
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/cupons/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Cupom excluído com sucesso');
        fetchCoupons();
      } else {
        toast.error('Erro ao excluir cupom');
      }
    } catch (error) {
      toast.error('Erro ao excluir cupom');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const discountValueNumber = parseFloat(
        formData.discountValue === '' ? '0' : formData.discountValue
      );
      if (!Number.isFinite(discountValueNumber) || discountValueNumber <= 0) {
        toast.error('Informe um valor de desconto maior que zero');
        setSaving(false);
        return;
      }

      const url = editingCoupon
        ? `/api/admin/cupons/${editingCoupon.id}`
        : '/api/admin/cupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        discountValue: formData.discountValue === '' ? '0' : formData.discountValue,
        minPurchase: formData.minPurchase === '' ? '0' : formData.minPurchase,
        maxUses: formData.maxUses === '' ? '0' : formData.maxUses,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          editingCoupon
            ? 'Cupom atualizado com sucesso'
            : 'Cupom criado com sucesso'
        );
        setDialogOpen(false);
        fetchCoupons();
      } else {
        toast.error(data.error || 'Erro ao salvar cupom');
      }
    } catch (error) {
      toast.error('Erro ao salvar cupom');
    } finally {
      setSaving(false);
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#00ff41]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cupons de Desconto</h1>
          <p className="text-zinc-400">Gerencie cupons para promotores e clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleNew}
              className="bg-[#00ff41] text-black hover:bg-[#00cc33]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Código *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  required
                  placeholder="PROMO20"
                  className="bg-zinc-800 border-zinc-700 text-white uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Parceiro</Label>
                <Input
                  value={formData.partnerName || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, partnerName: e.target.value })
                  }
                  placeholder="Nome do parceiro"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Tipo de Desconto *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, discountType: value })
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="percentage" className="text-white">
                        Porcentagem (%)
                      </SelectItem>
                      <SelectItem value="fixed" className="text-white">
                        Valor Fixo (R$)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">
                    Valor {formData.discountType === 'percentage' ? '(%)' : '(R$)'} *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: e.target.value,
                      })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Compra Mínima (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minPurchase: e.target.value,
                      })
                    }
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Máximo de Usos</Label>
                  <Input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxUses: e.target.value,
                      })
                    }
                    placeholder="0 = ilimitado"
                    disabled={formData.unlimitedUses}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                <div>
                  <Label className="text-zinc-300">Uso ilimitado</Label>
                  <p className="text-xs text-zinc-500">Ignora o máximo de usos</p>
                </div>
                <Switch
                  checked={formData.unlimitedUses}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      unlimitedUses: checked,
                      maxUses: checked ? '' : formData.maxUses,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Válido De *</Label>
                  <Input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Válido Até *</Label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                <div>
                  <Label className="text-zinc-300">Cupom Ativo</Label>
                  <p className="text-xs text-zinc-500">Desative para pausar o cupom</p>
                </div>
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-zinc-700 text-zinc-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#00ff41] text-black hover:bg-[#00cc33]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Cupons */}
      <div className="grid gap-4 md:grid-cols-2">
        {coupons.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 md:col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Ticket className="h-12 w-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400">Nenhum cupom cadastrado</p>
              <Button
                onClick={handleNew}
                className="mt-4 bg-[#00ff41] text-black hover:bg-[#00cc33]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Cupom
              </Button>
            </CardContent>
          </Card>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono font-bold text-lg text-[#00ff41]">
                        {coupon.code}
                      </h3>
                      {!coupon.active && (
                        <Badge className="bg-zinc-700 text-zinc-400">Inativo</Badge>
                      )}
                      {coupon.active && isExpired(coupon.validUntil) && (
                        <Badge className="bg-red-500/10 text-red-500">Expirado</Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : `R$ ${Number(coupon.discountValue).toFixed(2)} OFF`}
                    </p>
                    {coupon.partnerName && (
                      <p className="text-sm text-zinc-400 mt-1">
                        Parceiro: {coupon.partnerName}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(coupon)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">
                            Excluir cupom?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-zinc-400">
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(coupon.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-zinc-500">Compra mínima:</span>
                    <span className="text-zinc-300 ml-1">
                      R$ {Number(coupon.minPurchase).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Usos:</span>
                    <span className="text-zinc-300 ml-1">
                      {coupon.usesCount}/{coupon.unlimitedUses ? '∞' : (coupon.maxUses ?? 0)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-500">Validade:</span>
                    <span className="text-zinc-300 ml-1">
                      {new Date(coupon.validFrom).toLocaleDateString('pt-BR')} -{' '}
                      {new Date(coupon.validUntil).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
