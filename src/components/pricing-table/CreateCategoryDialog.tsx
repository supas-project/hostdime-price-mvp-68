
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePricingTable } from '@/hooks/usePricingTable';

interface CreateCategoryDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCategoryDialog({ open, onClose }: CreateCategoryDialogProps) {
  const { createCategory, loading } = usePricingTable();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    component_type: '',
    display_order: 0
  });

  const componentTypes = [
    { value: 'cpu', label: 'Processador' },
    { value: 'memory', label: 'Memória' },
    { value: 'storage', label: 'Armazenamento' },
    { value: 'os', label: 'Sistema Operacional' },
    { value: 'connectivity', label: 'Conectividade' },
    { value: 'datacenter', label: 'Data Center' },
    { value: 'contract', label: 'Contrato' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.component_type) {
      return;
    }

    await createCategory({
      ...formData,
      is_active: true
    });
    
    onClose();
    setFormData({
      name: '',
      description: '',
      component_type: '',
      display_order: 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome da categoria"
              required
            />
          </div>

          <div>
            <Label htmlFor="component_type">Tipo de Componente *</Label>
            <Select
              value={formData.component_type}
              onValueChange={(value) => setFormData({ ...formData, component_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {componentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição da categoria"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="display_order">Ordem de Exibição</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              Criar Categoria
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
