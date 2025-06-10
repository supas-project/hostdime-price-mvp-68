
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PriceModifier } from '@/services/pricing-table-service';

interface PriceModifiersTableProps {
  modifiers: PriceModifier[];
  loading: boolean;
}

export function PriceModifiersTable({ modifiers, loading }: PriceModifiersTableProps) {
  const getModifierTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      percentage: 'Percentual',
      fixed: 'Valor Fixo',
      multiplier: 'Multiplicador'
    };
    return labels[type] || type;
  };

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'fixed':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'multiplier':
        return `x${value}`;
      default:
        return value.toString();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando modificadores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Modificadores de Preço</h3>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Aplica-se a</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modifiers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum modificador encontrado</p>
                </TableCell>
              </TableRow>
            ) : (
              modifiers.map((modifier) => (
                <TableRow key={modifier.id}>
                  <TableCell className="font-medium">{modifier.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getModifierTypeLabel(modifier.modifier_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatValue(modifier.value, modifier.modifier_type)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {modifier.applies_to.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{modifier.priority}</TableCell>
                  <TableCell>
                    <Badge variant={modifier.is_active ? 'default' : 'secondary'}>
                      {modifier.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
