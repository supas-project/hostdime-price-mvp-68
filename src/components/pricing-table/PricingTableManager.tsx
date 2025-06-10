import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, RotateCcw, Settings } from 'lucide-react';
import { usePricingTable } from '@/hooks/usePricingTable';
import { CategoriesTable } from './CategoriesTable';
import { ItemsTable } from './ItemsTable';
import { PriceModifiersTable } from './PriceModifiersTable';
import { SyncStatus } from './SyncStatus';

export function PricingTableManager() {
  const {
    categories,
    items,
    priceModifiers,
    loading,
    loadCategories,
    loadItemsByCategory,
    syncWithStaticData
  } = usePricingTable();

  const [activeTab, setActiveTab] = useState('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    loadItemsByCategory(categoryId);
    setActiveTab('items');
  };

  const handleSyncAll = async () => {
    await syncWithStaticData();
    await loadCategories();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tabela de Preços</h1>
          <p className="text-muted-foreground">
            Gerencie categorias, itens e modificadores de preço
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <SyncStatus />
          <Button
            variant="outline"
            onClick={handleSyncAll}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar Dados
          </Button>
          <Button
            variant="outline"
            onClick={loadCategories}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorias</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Badge variant="secondary">Ativas</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Itens</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
              <Badge variant="secondary">Selecionada</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Modificadores</p>
                <p className="text-2xl font-bold">{priceModifiers.length}</p>
              </div>
              <Badge variant="secondary">Preço</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-sm font-semibold text-green-600">Sincronizado</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Online
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gerenciamento de Componentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="categories">
                Categorias ({categories.length})
              </TabsTrigger>
              <TabsTrigger value="items">
                Itens ({items.length})
              </TabsTrigger>
              <TabsTrigger value="modifiers">
                Modificadores ({priceModifiers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="mt-6">
              <CategoriesTable
                categories={categories}
                loading={loading}
                onCategorySelect={handleCategorySelect}
              />
            </TabsContent>

            <TabsContent value="items" className="mt-6">
              <ItemsTable
                items={items}
                categories={categories}
                loading={loading}
                selectedCategoryId={selectedCategoryId}
              />
            </TabsContent>

            <TabsContent value="modifiers" className="mt-6">
              <PriceModifiersTable
                modifiers={priceModifiers}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
