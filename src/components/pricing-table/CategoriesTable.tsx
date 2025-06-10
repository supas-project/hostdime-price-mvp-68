
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
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { ComponentCategory } from '@/services/pricing-table-service';
import { usePricingTable } from '@/hooks/usePricingTable';
import { CreateCategoryDialog } from './CreateCategoryDialog';
import { EditCategoryDialog } from './EditCategoryDialog';

interface CategoriesTableProps {
  categories: ComponentCategory[];
  loading: boolean;
  onCategorySelect: (categoryId: string) => void;
}

export function CategoriesTable({ categories, loading, onCategorySelect }: CategoriesTableProps) {
  const { deleteCategory } = usePricingTable();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ComponentCategory | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      await deleteCategory(id);
    }
  };

  const getComponentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      cpu: 'Processador',
      memory: 'Memória',
      storage: 'Armazenamento',
      os: 'Sistema Operacional',
      connectivity: 'Conectividade',
      datacenter: 'Data Center',
      contract: 'Contrato'
    };
    return labels[type] || type;
  };

  const getComponentTypeBadgeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      cpu: 'bg-blue-100 text-blue-800',
      memory: 'bg-green-100 text-green-800',
      storage: 'bg-purple-100 text-purple-800',
      os: 'bg-orange-100 text-orange-800',
      connectivity: 'bg-red-100 text-red-800',
      datacenter: 'bg-indigo-100 text-indigo-800',
      contract: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Categorias</h3>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Categorias</h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge className={getComponentTypeBadgeColor(category.component_type)}>
                      {getComponentTypeLabel(category.component_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {category.description || '-'}
                  </TableCell>
                  <TableCell>{category.display_order}</TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                      {category.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCategorySelect(category.id)}
                        title="Ver itens"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
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

      {/* Diálogos */}
      <CreateCategoryDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />

      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          open={!!editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
}
