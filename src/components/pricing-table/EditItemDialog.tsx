
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
import { Switch } from '@/components/ui/switch';
import { ComponentItem } from '@/services/pricing-table-service';
import { usePricingTable } from '@/hooks/usePricingTable';

interface EditItemDialogProps {
  item: ComponentItem;
  open: boolean;
  onClose: () => void;
}

export function EditItemDialog({ item, open, onClose }: EditItemDialogProps) {
  const { updateItem, loading } = usePricingTable();
  const [formData, setFormData] = useState({
    component_id: '',
    name: '',
    description: '',
    price: 0,
    base_price: 0,
    subtype: '',
    is_hardware: false,
    specs: '',
    metadata: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    if (item) {
      setFormData({
        component_id: item.component_id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        base_price: item.base_price,
        subtype: item.subtype || '',
        is_hardware: item.is_hardware,
        specs: Array.isArray(item.specs) ? item.specs.join('\n') : '',
        metadata: JSON.stringify(item.metadata, null, 2),
        display_order: item.display_order,
        is_active: item.is_active
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.component_id || !formData.name) {
      return;
    }

    // Parse specs and metadata
    let specs: string[] = [];
    let metadata: Record<string, any> = {};

    try {
      if (formData.specs) {
        specs = formData.specs.split('\n').filter(spec => spec.trim());
      }
      if (formData.metadata) {
        metadata = JSON.parse(formData.metadata);
      }
    } catch (error) {
      console.error('Erro ao fazer parse dos dados:', error);
      return;
    }

    await updateItem(item.id, {
      component_id: formData.component_id,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      base_price: formData.base_price,
      subtype: formData.subtype,
      is_hardware: formData.is_hardware,
      specs,
      metadata,
      display_order: formData.display_order,
      is_active: formData.is_active
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="component_id">ID do Componente *</Label>
              <Input
                id="component_id"
                value={formData.component_id}
                onChange={(e) => setFormData({ ...formData, component_id: e.target.value })}
                placeholder="ex: cpu-intel-i7-12700k"
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do item"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do item"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Preço *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="base_price">Preço Base</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="subtype">Subtipo</Label>
              <Input
                id="subtype"
                value={formData.subtype}
                onChange={(e) => setFormData({ ...formData, subtype: e.target.value })}
                placeholder="standard, premium, etc."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specs">Especificações (uma por linha)</Label>
            <Textarea
              id="specs"
              value={formData.specs}
              onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
              placeholder="8 cores, 16 threads&#10;3.6 GHz base clock&#10;4.9 GHz boost"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              value={formData.metadata}
              onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
              placeholder='{"cores": 8, "threads": 16, "socket": "LGA1700"}'
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="is_hardware"
                checked={formData.is_hardware}
                onCheckedChange={(checked) => setFormData({ ...formData, is_hardware: checked })}
              />
              <Label htmlFor="is_hardware">É hardware</Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Item ativo</Label>
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
