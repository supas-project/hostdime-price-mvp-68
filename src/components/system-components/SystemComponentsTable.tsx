
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface UnifiedSystemComponent {
  id: string;
  component_type: string;
  component_id: string;
  name: string;
  description?: string;
  price: number;
  subtype?: string;
  is_hardware: boolean;
  is_active: boolean;
  specs?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface SystemComponentsTableProps {
  components: UnifiedSystemComponent[];
  loading: boolean;
  onRefetch: () => void;
}

export function SystemComponentsTable({ components, loading, onRefetch }: SystemComponentsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando componentes...</p>
        </div>
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Nenhum componente encontrado</p>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione componentes usando o botão "Novo Componente"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Subtipo</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Hardware</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((component) => (
            <TableRow key={component.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{component.name}</p>
                  {component.description && (
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  {component.component_id}
                </code>
              </TableCell>
              <TableCell>
                {component.subtype && (
                  <Badge variant="outline">{component.subtype}</Badge>
                )}
              </TableCell>
              <TableCell>{formatCurrency(component.price)}</TableCell>
              <TableCell>
                <Badge variant={component.is_hardware ? 'default' : 'secondary'}>
                  {component.is_hardware ? 'Hardware' : 'Software'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={component.is_active ? 'default' : 'destructive'}>
                  {component.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
