import { GroupedCategory } from '@/hooks/price-table/usePriceTableState';

interface PriceTableContentProps {
  categories: GroupedCategory[];
}

export const PriceTableContent = ({ categories }: PriceTableContentProps) => {
  if (categories.length === 0) {
    return (
      <div className="text-center p-10 mt-4">
        <h3 className="text-lg font-semibold">Nenhuma Categoria para Exibir</h3>
        <p className="text-sm text-muted-foreground">
          Verifique se os dados foram carregados corretamente ou adicione novos itens.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <div key={category.id} className="space-y-4">
          <h3 className="text-lg font-semibold">{category.display_name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.items.map(item => (
              <div key={item.id} className="p-4 border rounded-lg">
                <h4 className="font-medium">{item.name}</h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
                <p className="font-semibold mt-2">R$ {item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};