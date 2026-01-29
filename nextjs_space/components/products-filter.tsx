'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProductsFilterProps {
  categories: string[];
  selectedCategory?: string;
}

export default function ProductsFilter({ categories, selectedCategory }: ProductsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (category === 'all') {
      params.delete('categoria');
    } else {
      params.set('categoria', category);
    }
    router.push(`/produtos?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/produtos');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant={!selectedCategory ? 'default' : 'outline'}
        onClick={() => handleCategoryChange('all')}
        className={!selectedCategory ? 'text-black' : ''}
      >
        Todos
      </Button>
      {categories?.map((category) => (
        <Button
          key={category ?? ''}
          variant={selectedCategory === category ? 'default' : 'outline'}
          onClick={() => handleCategoryChange(category ?? '')}
          className={selectedCategory === category ? 'text-black' : ''}
        >
          {category ?? ''}
        </Button>
      ))}
      {selectedCategory && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Limpar Filtros
        </Button>
      )}
    </div>
  );
}
