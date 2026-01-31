'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductsFilterProps {
  categories: string[];
  productNames: string[];
  brands: string[];
  selectedCategory?: string;
}

export default function ProductsFilter({
  categories,
  productNames,
  brands,
  selectedCategory,
}: ProductsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [productQuery, setProductQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const priorityCategories = [
    'WHEY PROTEIN',
    'CREATINA',
    'VITAMINAS',
    'PROTEINAS',
    'PRE TREINO',
    'PRE TREINOS',
    'PRÉ-TREINO',
    'OMEGA 3',
    'COLAGENO',
    'DOCE FIT',
  ];

  const searchValue = searchParams?.get('busca') ?? '';

  useEffect(() => {
    setProductQuery(searchValue);
    setShowProductSuggestions(false);
  }, [searchValue]);

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (category === 'all') {
      params.delete('categoria');
    } else {
      params.set('categoria', category);
    }
    router.push(`/produtos?${params.toString()}`);
  };

  const handleBrandChange = (brand: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (brand === 'all') {
      params.delete('marca');
    } else {
      params.set('marca', brand);
    }
    router.push(`/produtos?${params.toString()}`);
  };

  const applyProductSearch = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    const trimmed = value.trim();
    if (!trimmed) {
      params.delete('busca');
    } else {
      params.set('busca', trimmed);
    }
    router.push(`/produtos?${params.toString()}`);
  };

  const sortedCategories = useMemo(() => {
    const normalized = (categories ?? []).filter(Boolean);
    return normalized.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  }, [categories]);

  const orderedCategories = useMemo(() => {
    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    const normalizedMap = new Map(
      sortedCategories.map((category) => [normalize(category), category])
    );
    const priority = priorityCategories
      .map((category) => normalizedMap.get(normalize(category)))
      .filter(Boolean) as string[];
    const prioritySet = new Set(priority);
    const remaining = sortedCategories.filter((category) => !prioritySet.has(category));
    return [...priority, ...remaining];
  }, [sortedCategories, priorityCategories]);

  const filteredProducts = useMemo(() => {
    const normalized = (productNames ?? []).filter(Boolean);
    const q = productQuery.trim();
    if (!q) return [];
    const normalizedQuery = q
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return normalized
      .filter((name) => {
        const normalizedName = name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
        return normalizedName.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [productNames, productQuery]);

  const visibleCategories = useMemo(() => {
    if (showAll) return orderedCategories;
    return orderedCategories.slice(0, 8);
  }, [orderedCategories, showAll]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyProductSearch(productQuery);
              }
            }}
            onFocus={() => setShowProductSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowProductSuggestions(false), 120);
            }}
            placeholder="Buscar produto..."
            className="pl-9"
          />
          {showProductSuggestions &&
            (filteredProducts.length > 0 ||
              (productQuery.trim().length > 0 && searchValue)) && (
            <div className="absolute left-0 right-0 z-10 mt-2 rounded-md border bg-background shadow-lg">
              {filteredProducts.length > 0 ? (
                <div className="max-h-64 overflow-auto py-1">
                  {filteredProducts.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => {
                        setProductQuery(name);
                        applyProductSearch(name);
                        setShowProductSuggestions(false);
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Nenhum produto encontrado
                </div>
              )}
            </div>
          )}
        </div>
        <Select
          onValueChange={handleBrandChange}
          value={searchParams?.get('marca') ?? ''}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Fabricante" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {(brands ?? []).map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={!selectedCategory ? 'default' : 'outline'}
          onClick={() => handleCategoryChange('all')}
          className={!selectedCategory ? 'text-black' : ''}
        >
          Todos
        </Button>
        {visibleCategories.map((category) => (
          <Button
            key={category ?? ''}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => handleCategoryChange(category ?? '')}
            className={selectedCategory === category ? 'text-black' : ''}
          >
            {category ?? ''}
          </Button>
        ))}
        {orderedCategories.length > 8 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll((prev) => !prev)}
            className="gap-2"
          >
            {showAll
              ? 'Mostrar menos'
              : `Ver todas as categorias (${orderedCategories.length})`}
          </Button>
        )}
      </div>
    </div>
  );
}
