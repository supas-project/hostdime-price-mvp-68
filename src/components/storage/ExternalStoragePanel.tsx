
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface ExternalStorageType {
  name: string;
  pricePerGB: number;
  iops: string;
  throughput: string;
  description: string;
}

interface ExternalStoragePanelProps {
  onSelectStorage: (type: string, capacity: number, price: number) => void;
  storageTypes: { [key: string]: ExternalStorageType };
}

export function ExternalStoragePanel({ onSelectStorage, storageTypes }: ExternalStoragePanelProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(100);
  
  // Memoize storage types list to prevent unnecessary re-renders
  const storageTypesList = useMemo(() => {
    return Object.entries(storageTypes);
  }, [storageTypes]);
  
  // Memoize the selected storage type to prevent recalculation
  const selectedStorageType = useMemo(() => {
    return selectedType && storageTypes[selectedType] ? storageTypes[selectedType] : null;
  }, [selectedType, storageTypes]);
  
  // Memoize total price calculation
  const totalPrice = useMemo(() => {
    if (!selectedStorageType) return 0;
    return capacity * selectedStorageType.pricePerGB;
  }, [capacity, selectedStorageType]);
  
  const handleTypeChange = useCallback((value: string) => {
    console.log(`[ExternalStoragePanel] Type changed: ${value}`);
    setSelectedType(value);
  }, []);
  
  const handleCapacityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newCapacity = parseInt(e.target.value) || 100;
    console.log(`[ExternalStoragePanel] Capacity changed: ${newCapacity}`);
    setCapacity(newCapacity);
  }, []);
  
  const handleAddStorage = useCallback(() => {
    if (!selectedStorageType || !selectedType) return;
    
    console.log(`[ExternalStoragePanel] Adding storage: ${selectedType}, ${capacity}GB, R$ ${totalPrice}`);
    onSelectStorage(selectedType, capacity, totalPrice);
  }, [selectedStorageType, selectedType, capacity, totalPrice, onSelectStorage]);
  
  if (storageTypesList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storage Externo</CardTitle>
          <CardDescription>
            Nenhum tipo de storage externo disponível no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Storage Externo</CardTitle>
          <CardDescription>
            Configure storage adicional para o seu servidor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storage-type">Tipo de Storage</Label>
            <Select onValueChange={handleTypeChange} value={selectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de storage" />
              </SelectTrigger>
              <SelectContent>
                {storageTypesList.map(([key, storageType]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center justify-between w-full">
                      <span>{storageType.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        R$ {storageType.pricePerGB.toFixed(2)}/GB
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedStorageType && (
            <>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm space-y-1">
                  <p><strong>IOPS:</strong> {selectedStorageType.iops}</p>
                  <p><strong>Throughput:</strong> {selectedStorageType.throughput}</p>
                  <p><strong>Descrição:</strong> {selectedStorageType.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade (GB)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="50"
                  max="10000"
                  step="50"
                  value={capacity}
                  onChange={handleCapacityChange}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div>
                  <p className="font-medium">Total: R$ {totalPrice.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    {capacity}GB × R$ {selectedStorageType.pricePerGB.toFixed(2)}/GB
                  </p>
                </div>
                <Button onClick={handleAddStorage} className="ml-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
