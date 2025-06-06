
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SystemComponentsService, SystemComponent } from '@/services/systemComponentsService';
import { toast } from 'sonner';

interface CreateComponentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComponentCreated: () => void;
  componentType: string;
}

export function CreateComponentDialog({ 
  isOpen, 
  onClose, 
  onComponentCreated, 
  componentType 
}: CreateComponentDialogProps) {
  const [formData, setFormData] = useState({
    component_id: '',
    name: '',
    description: '',
    price: 0,
    subtype: '',
    is_hardware: false,
    specs: [] as string[],
    metadata: {}
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const componentData = {
        component_type: componentType,
        component_id: formData.component_id,
        name: formData.name,
        description: formData.description || undefined,
        price: formData.price,
        subtype: formData.subtype || undefined,
        is_hardware: formData.is_hardware,
        is_active: true,
        specs: formData.specs.length > 0 ? formData.specs : undefined,
        metadata: Object.keys(formData.metadata).length > 0 ? formData.metadata : undefined
      };

      await SystemComponentsService.createComponent(componentData);
      
      toast.success('Componente criado com sucesso');
      onComponentCreated();
      
      // Reset form
      setFormData({
        component_id: '',
        name: '',
        description: '',
        price: 0,
        subtype: '',
        is_hardware: false,
        specs: [],
        metadata: {}
      });
    } catch (error) {
      console.error('Error creating component:', error);
      toast.error('Erro ao criar componente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Componente - {componentType.toUpperCase()}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="component_id">ID do Componente</Label>
              <Input
                id="component_id"
                value={formData.component_id}
                onChange={(e) => setFormData(prev => ({ ...prev, component_id: e.target.value }))}
                placeholder="cpu-1, memory-64gb, etc."
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do componente"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição detalhada do componente"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="subtype">Subtipo</Label>
              <Input
                id="subtype"
                value={formData.subtype}
                onChange={(e) => setFormData(prev => ({ ...prev, subtype: e.target.value }))}
                placeholder="windows, linux, nvme, etc."
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_hardware"
              checked={formData.is_hardware}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_hardware: checked }))}
            />
            <Label htmlFor="is_hardware">É um componente de hardware</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Componente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
