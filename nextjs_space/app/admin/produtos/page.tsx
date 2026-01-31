'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Package, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from 'sonner';


interface Product {
  id: number;
  name: string;
  aliasName?: string | null;
  needsAttention?: boolean | null;
  groupCode?: string | null;
  sku?: string | null;
  description: string;
  category: string;
  brand: string;
  costPrice: number | null;
  marginPercentage: number | null;
  price: number;
  imageUrl: string;
  supplierUrl: string | null;
  stockType: string;
  stockAvailable?: number | null;
  stockDistributor?: number | null;
}

const emptyStockForm = {
  productId: '',
  stockQuantity: 0,
  costPrice: null as number | null,
  marginPercentage: null as number | null,
  priceFinal: null as number | null,
  imageUrl: '',
};

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockForm, setStockForm] = useState(emptyStockForm);
  const [saving, setSaving] = useState(false);
  const [showOnlyAttention, setShowOnlyAttention] = useState(true);
  const [productQuery, setProductQuery] = useState('');
  const [productSkuQuery, setProductSkuQuery] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  useEffect(() => {
    fetchProducts(showOnlyAttention);
  }, [showOnlyAttention]);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchProducts = async (onlyAttention = false) => {
    setLoading(true);
    try {
      const url = onlyAttention
        ? '/api/admin/produtos?needsAttention=true'
        : '/api/admin/produtos';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || 'Erro ao carregar produtos');
        setProducts([]);
        return;
      }
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await fetch('/api/admin/produtos');
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || 'Erro ao carregar produtos');
        setAllProducts([]);
        return;
      }
      setAllProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
      setAllProducts([]);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    const skuQuery = productSkuQuery.trim().toLowerCase();
    const list = allProducts ?? [];
    const byName = [...list].sort((a, b) =>
      (a?.name ?? '').localeCompare(b?.name ?? '', 'pt-BR', { sensitivity: 'base' })
    );
    if (!query && !skuQuery) return byName;
    return byName.filter((p) => {
      const nameMatch = (p?.name ?? '').toLowerCase().includes(query);
      const skuMatch = (p?.sku ?? '').toLowerCase() === skuQuery;
      return (query ? nameMatch : true) && (skuQuery ? skuMatch : true);
    });
  }, [allProducts, productQuery, productSkuQuery]);

  const sortedProducts = useMemo(() => {
    return [...(products ?? [])].sort((a, b) =>
      (a?.name ?? '').localeCompare(b?.name ?? '', 'pt-BR', { sensitivity: 'base' })
    );
  }, [products]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const margin = 50;
    const cost = product.costPrice ?? null;
    const priceFinal = cost !== null ? cost * (1 + margin / 100) : null;
    const priceNumber =
      priceFinal === null || priceFinal === undefined ? null : Number(priceFinal);
    const safePrice = Number.isFinite(priceNumber) ? priceNumber : null;
    setStockForm({
      productId: String(product.id),
      stockQuantity: product.stockAvailable ?? 0,
      costPrice: cost,
      marginPercentage: margin,
      priceFinal: safePrice !== null ? parseFloat(safePrice.toFixed(2)) : null,
      imageUrl: product.imageUrl ?? '',
    });
    setProductQuery(product.name ?? '');
    setProductSkuQuery(product.sku ?? '');
    setShowProductSuggestions(false);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setStockForm({ ...emptyStockForm, marginPercentage: 50 });
    setProductQuery('');
    setProductSkuQuery('');
    setShowProductSuggestions(false);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/produtos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Produto excluído com sucesso');
        fetchProducts(showOnlyAttention);
      } else {
        toast.error('Erro ao excluir produto');
      }
    } catch (error) {
      toast.error('Erro ao excluir produto');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockForm),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Estoque atualizado com sucesso');
        setDialogOpen(false);
        fetchProducts(showOnlyAttention);
      } else {
        toast.error(data?.error || 'Erro ao atualizar estoque');
      }
    } catch (error) {
      toast.error('Erro ao atualizar estoque');
    } finally {
      setSaving(false);
    }
  };

  const updateMarginAndPrice = (cost: number | null, margin: number | null) => {
    if (cost === null || margin === null) {
      setStockForm((prev) => ({ ...prev, costPrice: cost, marginPercentage: margin, priceFinal: null }));
      return;
    }
    const price = cost * (1 + margin / 100);
    setStockForm((prev) => ({
      ...prev,
      costPrice: cost,
      marginPercentage: margin,
      priceFinal: parseFloat(price.toFixed(2)),
    }));
  };

  const updateMarginFromPrice = (cost: number | null, price: number | null) => {
    if (cost === null || price === null || cost <= 0) {
      setStockForm((prev) => ({ ...prev, priceFinal: price }));
      return;
    }
    const margin = ((price / cost) - 1) * 100;
    setStockForm((prev) => ({
      ...prev,
      costPrice: cost,
      marginPercentage: parseFloat(margin.toFixed(2)),
      priceFinal: price,
    }));
  };

  const applyProductSelection = (product: Product) => {
    const margin = 50;
    const cost = product?.costPrice ?? null;
    const price = cost !== null ? cost * (1 + margin / 100) : null;
    setStockForm({
      ...stockForm,
      productId: String(product.id),
      costPrice: cost,
      marginPercentage: margin,
      priceFinal: price !== null ? parseFloat(price.toFixed(2)) : null,
      imageUrl: product?.imageUrl ?? '',
      stockQuantity: product?.stockAvailable ?? 0,
    });
    setProductQuery(product?.name ?? '');
    setProductSkuQuery(product?.sku ?? '');
    setShowProductSuggestions(false);
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Estoque</h1>
            {showOnlyAttention && (
              <Badge className="border border-red-500/40 bg-red-500/15 text-red-300">
                Pendencias
              </Badge>
            )}
          </div>
          <p className="text-zinc-400">
            {showOnlyAttention
              ? 'Mostrando apenas produtos que precisam de atenção do admin'
              : 'Mostrando todos os produtos'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowOnlyAttention((prev) => !prev)}
            className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
          >
            {showOnlyAttention ? 'Ver todos' : 'Ver pendencias'}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleNew}
              className="bg-[#00ff41] text-black hover:bg-[#00cc33]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Estoque
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingProduct ? 'Editar Estoque' : 'Adicionar Estoque'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Produto *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-8 gap-2">
                    <div className="relative md:col-span-6">
                      <Input
                        placeholder="Buscar produto..."
                        value={productQuery}
                        onChange={(e) => {
                          setProductQuery(e.target.value);
                          setShowProductSuggestions(true);
                        }}
                        onFocus={() => setShowProductSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => setShowProductSuggestions(false), 120);
                        }}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                      {showProductSuggestions && productQuery.trim().length > 0 && (
                        <div className="absolute left-0 right-0 z-10 mt-2 rounded-md border border-zinc-700 bg-zinc-900 shadow-lg">
                          {filteredProducts.length > 0 ? (
                            <div className="max-h-64 overflow-auto py-1">
                              {filteredProducts.map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-zinc-800"
                                  onClick={() => applyProductSelection(product)}
                                >
                                  {product.name}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="px-3 py-2 text-sm text-zinc-400">
                              Nenhum produto encontrado
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Input
                      placeholder="Filtrar por SKU..."
                      value={productSkuQuery}
                      onChange={(e) => setProductSkuQuery(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white md:col-span-2"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 w-full max-w-[140px]">
                <Label className="text-zinc-300">Quantidade em Estoque *</Label>
                  <Input
                    type="number"
                    value={stockForm.stockQuantity === 0 ? '' : stockForm.stockQuantity}
                    onChange={(e) =>
                      setStockForm({
                        ...stockForm,
                        stockQuantity: e.target.value === '' ? 0 : parseInt(e.target.value, 10),
                      })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Link da Imagem</Label>
                <Input
                  type="url"
                  value={stockForm.imageUrl ?? ''}
                  onChange={(e) =>
                    setStockForm({
                      ...stockForm,
                      imageUrl: e.target.value,
                    })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              {/* Precificação */}
              <div className="p-4 bg-zinc-800/50 rounded-lg space-y-4">
                <h3 className="text-white font-medium">Precificação (pronta entrega)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Custo (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={stockForm.costPrice ?? ''}
                      onChange={(e) =>
                        updateMarginAndPrice(
                          e.target.value ? parseFloat(e.target.value) : null,
                          stockForm.marginPercentage
                        )
                      }
                      required
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Margem (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={stockForm.marginPercentage ?? ''}
                      onChange={(e) =>
                        updateMarginAndPrice(
                          stockForm.costPrice,
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      required
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Preço Final (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={stockForm.priceFinal ?? ''}
                      onChange={(e) =>
                        updateMarginFromPrice(
                          stockForm.costPrice,
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
                <p className="text-xs text-zinc-500">
                  Você pode ajustar a margem ou o preço final; o outro será recalculado.
                </p>
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
                  disabled={saving || !stockForm.productId}
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
      </div>

      {/* Lista de Produtos */}
      <div className="grid gap-4">
        {products.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400">Nenhum produto cadastrado</p>
              <Button
                onClick={handleNew}
                className="mt-4 bg-[#00ff41] text-black hover:bg-[#00cc33]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Estoque
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedProducts.map((product) => (
            <Card key={product.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">
                            {product.aliasName || product.name}
                          </h3>
                          {product.costPrice === null && (
                            <Badge className="bg-yellow-500/10 text-yellow-500">
                              Revisar
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400">
                          {product.brand} • {product.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {product.supplierUrl && (
                          <a
                            href={product.supplierUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-[#00ff41]"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
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
                                Excluir produto?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-zinc-400">
                                Esta ação não pode ser desfeita. O produto será
                                permanentemente removido.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-[#00ff41]">
                        R$ {Number(product.price).toFixed(2)}
                      </span>
                      {product.costPrice && (
                        <span className="text-xs text-zinc-500">
                          (Custo: R$ {Number(product.costPrice).toFixed(2)})
                        </span>
                        )}
                        <span className="text-xs text-zinc-500">
                          Loja: {product.stockAvailable ?? 0}
                        </span>
                        <span className="text-xs text-zinc-500">
                          Dist.: {product.stockDistributor ?? 0}
                        </span>
                        <Badge
                        className={
                          product.stockType === 'pronta_entrega'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }
                      >
                        {product.stockType === 'pronta_entrega'
                          ? 'Pronta Entrega'
                          : 'Sob Encomenda'}
                      </Badge>
                    </div>
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
