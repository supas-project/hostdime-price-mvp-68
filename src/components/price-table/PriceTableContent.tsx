import { CategoryTabs } from './CategoryTabs';
import { GroupedCategory } from '@/hooks/usePriceTable';

interface PriceTableContentProps {
  categories: GroupedCategory[];
}

export const PriceTableContent = ({ categories }: PriceTableContentProps) => {
  if (categories.length === 0) {
    return (
      <div className="text-center p-10 mt-4">
        <h3 className="text-lg font-semibold">Nenhuma Categoria para Exibir</h3>
        <p className="text-sm text-muted-foreground">Verifique se os dados foram migrados corretamente.</p>
      </div>
    );
  }

  return <CategoryTabs categories={categories} />;
};
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
