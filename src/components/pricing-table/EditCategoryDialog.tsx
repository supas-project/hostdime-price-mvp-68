
import React, { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { ComponentCategory } from '@/services/pricing-table-service';
import { usePricingTable } from '@/hooks/usePricingTable';

interface EditCategoryDialogProps {
  category: ComponentCategory;
  open: boolean;
  onClose: () => void;
}

export function EditCategoryDialog({ category, open, onClose }: EditCategoryDialogProps) {
  const { updateCategory, loading } = usePricingTable();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    component_type: '',
    display_order: 0,
    is_active: true
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

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        component_type: category.component_type,
        display_order: category.display_order,
        is_active: category.is_active
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.component_type) {
      return;
    }

    await updateCategory(category.id, formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Categoria ativa</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
