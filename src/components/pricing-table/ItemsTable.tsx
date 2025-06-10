
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { ComponentItem, ComponentCategory } from '@/services/pricing-table-service';
import { usePricingTable } from '@/hooks/usePricingTable';
import { CreateItemDialog } from './CreateItemDialog';
import { EditItemDialog } from './EditItemDialog';

interface ItemsTableProps {
  items: ComponentItem[];
  categories: ComponentCategory[];
  loading: boolean;
  selectedCategoryId: string;
}

export function ItemsTable({ items, categories, loading, selectedCategoryId }: ItemsTableProps) {
  const { deleteItem, loadCategories } = usePricingTable();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ComponentItem | null>(null);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      await deleteItem(id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando itens...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={loadCategories}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Categorias
          </Button>
          {selectedCategory && (
            <div>
              <h3 className="text-lg font-semibold">{selectedCategory.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
            </div>
          )}
        </div>
        
        {selectedCategoryId && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
        )}
      </div>

      {!selectedCategoryId ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Selecione uma categoria para ver os itens</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>ID Componente</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Subtipo</TableHead>
                <TableHead>Hardware</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum item encontrado nesta categoria</p>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-mono text-sm">{item.component_id}</TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(item.price)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.subtype || 'Standard'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_hardware ? 'default' : 'secondary'}>
                        {item.is_hardware ? 'Sim' : 'Não'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? 'default' : 'secondary'}>
                        {item.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingItem(item)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          title="Excluir"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogos */}
      {selectedCategoryId && (
        <CreateItemDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          categoryId={selectedCategoryId}
        />
      )}

      {editingItem && (
        <EditItemDialog
          item={editingItem}
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
