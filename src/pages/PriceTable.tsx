import { useAppStore } from '@/store/appStore';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database } from 'lucide-react';

export default function PriceTable() {
  const { items, categories, status, getComponentsByCategory } = useAppStore();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Carregando dados da tabela de preços...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive" className="m-4">
        <Database className="h-4 w-4" />
        <AlertTitle>Erro ao Carregar Dados</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os dados da tabela de preços. Verifique sua conexão e tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tabela de Preços</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os preços e componentes do sistema. {items.length} itens em {categories.length} categorias.
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => {
          const categoryItems = getComponentsByCategory(category);
          
          return (
            <div key={category} className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 capitalize">{category}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-2">
                    <h3 className="font-medium">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">
                        R$ {item.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ID: {item.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {categoryItems.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum item encontrado nesta categoria.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
          <p className="text-muted-foreground">
            Verifique se os dados foram carregados corretamente.
          </p>
        </div>
      )}
    </div>
  );
}
