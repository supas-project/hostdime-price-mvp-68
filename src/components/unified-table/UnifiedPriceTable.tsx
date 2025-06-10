
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Save, X, GripVertical } from 'lucide-react';
import { useUnifiedData } from '@/hooks/useUnifiedData';
import { Category, Item } from '@/types/database';
import { formatCurrency } from '@/lib/utils';
import { CategoryForm } from './CategoryForm';
import { ItemForm } from './ItemForm';
import { ChangeLogViewer } from './ChangeLogViewer';

export function UnifiedPriceTable() {
  const {
    categories,
    items,
    changeLog,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem,
    getItemsByCategory
  } = useUnifiedData();

  const [activeTab, setActiveTab] = useState('categories');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Inline editing states
  const [editingValues, setEditingValues] = useState<Record<string, any>>({});

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category.id);
    setEditingValues({ [category.id]: { name: category.name, description: category.description } });
  };

  const handleSaveCategory = async (categoryId: string) => {
    const values = editingValues[categoryId];
    if (values) {
      await updateCategory(categoryId, values);
    }
    setEditingCategory(null);
    setEditingValues(prev => {
      const { [categoryId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item.id);
    setEditingValues({ 
      [item.id]: { 
        name: item.name, 
        description: item.description, 
        price: item.price 
      } 
    });
  };

  const handleSaveItem = async (itemId: string) => {
    const values = editingValues[itemId];
    if (values) {
      await updateItem(itemId, values);
    }
    setEditingItem(null);
    setEditingValues(prev => {
      const { [itemId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleCancelEdit = (id: string) => {
    setEditingCategory(null);
    setEditingItem(null);
    setEditingValues(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciamento Unificado</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCategoryForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
          <Button onClick={() => setShowItemForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Item
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Categorias ({categories.length})</TabsTrigger>
          <TabsTrigger value="items">Itens ({items.length})</TabsTrigger>
          <TabsTrigger value="changelog">Log de Alterações</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      <div className="flex-1">
                        {editingCategory === category.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingValues[category.id]?.name || ''}
                              onChange={(e) => setEditingValues(prev => ({
                                ...prev,
                                [category.id]: { ...prev[category.id], name: e.target.value }
                              }))}
                              placeholder="Nome da categoria"
                            />
                            <Input
                              value={editingValues[category.id]?.description || ''}
                              onChange={(e) => setEditingValues(prev => ({
                                ...prev,
                                [category.id]: { ...prev[category.id], description: e.target.value }
                              }))}
                              placeholder="Descrição"
                            />
                          </div>
                        ) : (
                          <div>
                            <h3 className="font-medium">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm text-gray-600">{category.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {getItemsByCategory(category.id).length} itens
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {editingCategory === category.id ? (
                        <>
                          <Button size="sm" onClick={() => handleSaveCategory(category.id)}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleCancelEdit(category.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          {categories.map((category) => {
            const categoryItems = getItemsByCategory(category.id);
            if (categoryItems.length === 0) return null;

            return (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <div className="flex-1">
                            {editingItem === item.id ? (
                              <div className="grid grid-cols-3 gap-2">
                                <Input
                                  value={editingValues[item.id]?.name || ''}
                                  onChange={(e) => setEditingValues(prev => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], name: e.target.value }
                                  }))}
                                  placeholder="Nome do item"
                                />
                                <Input
                                  value={editingValues[item.id]?.description || ''}
                                  onChange={(e) => setEditingValues(prev => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], description: e.target.value }
                                  }))}
                                  placeholder="Descrição"
                                />
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editingValues[item.id]?.price || ''}
                                  onChange={(e) => setEditingValues(prev => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], price: parseFloat(e.target.value) || 0 }
                                  }))}
                                  placeholder="Preço"
                                />
                              </div>
                            ) : (
                              <div>
                                <h4 className="font-medium">{item.name}</h4>
                                {item.description && (
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-lg">
                              {formatCurrency(item.price)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {editingItem === item.id ? (
                            <>
                              <Button size="sm" onClick={() => handleSaveItem(item.id)}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleCancelEdit(item.id)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEditItem(item)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => deleteItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="changelog">
          <ChangeLogViewer changeLog={changeLog} />
        </TabsContent>
      </Tabs>

      {showCategoryForm && (
        <CategoryForm
          onSubmit={async (data) => {
            await addCategory({
              ...data,
              active: true,
              display_order: categories.length
            });
            setShowCategoryForm(false);
          }}
          onCancel={() => setShowCategoryForm(false)}
        />
      )}

      {showItemForm && (
        <ItemForm
          categories={categories}
          onSubmit={async (data) => {
            await addItem({
              ...data,
              active: true,
              display_order: getItemsByCategory(data.category_id).length,
              specs: {},
              tags: []
            });
            setShowItemForm(false);
          }}
          onCancel={() => setShowItemForm(false)}
        />
      )}
    </div>
  );
}
