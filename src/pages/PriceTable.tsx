import { usePriceTableState } from '@/hooks/price-table/usePriceTableState';
import { PriceTableContent } from '@/components/price-table/PriceTableContent';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';

export default function PriceTable() {
  const { groupedCategories, searchTerm, setSearchTerm, status, isLoading } = usePriceTableState();
  const { fetchInitialData } = useAppStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar dados</p>
          <Button onClick={fetchInitialData}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tabela de Preços</h1>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Buscar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>
      
      <PriceTableContent categories={groupedCategories} />
    </div>
  );
}