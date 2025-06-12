import { useMemo } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { GroupedCategory } from '@/hooks/usePriceTable'; // Importando o tipo do nosso hook

// A interface de props para este componente
interface PriceTableContentProps {
  categories: GroupedCategory[];
  searchTerm: string;
  sortOrder: 'asc' | 'desc';
}

export const PriceTableContent = ({ 
  categories, 
  searchTerm, 
  sortOrder 
}: PriceTableContentProps) => {

  // A lógica de filtro e ordenação agora vive aqui, de forma clara.
  const filteredAndSortedCategories = useMemo(() => {
    if (!categories) return [];

    return categories
      .map(category => {
        // Filtra os itens dentro de cada categoria com base no termo de busca
        const filteredItems = category.items.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Retorna a categoria apenas se ela tiver itens após o filtro
        return { ...category, items: filteredItems };
      })
      .filter(category => category.items.length > 0) // Remove categorias que ficaram vazias
      .sort((a, b) => {
        // Ordena as categorias pelo nome
        if (sortOrder === 'asc') {
          return a.nome.localeCompare(b.nome);
        }
        return b.nome.localeCompare(a.nome);
      });
  }, [categories, searchTerm, sortOrder]);

  // Adicionamos um log final para ter certeza do que está sendo renderizado
  console.log('[UI-RENDER] PriceTableContent está renderizando com', filteredAndSortedCategories.length, 'categorias filtradas.');

  if (filteredAndSortedCategories.length === 0) {
    return (
      <div className="text-center p-10 bg-muted/20 rounded-lg mt-4">
        <h3 className="text-lg font-semibold">Nenhum item ou categoria encontrada</h3>
        <p className="text-sm text-muted-foreground">
          Tente ajustar sua busca ou adicione novos itens.
        </p>
      </div>
    );
  }

  // O componente agora simplesmente passa os dados filtrados e ordenados para as abas.
  return <CategoryTabs categories={filteredAndSortedCategories} />;
};
