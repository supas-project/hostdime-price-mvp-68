
import { useDiskActions } from './useDiskActions';
import { useState } from 'react';
import { PricedDiskOption } from '@/types/storage';

interface DiskManagementProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
  initialDiskType?: "nvme" | "ssd" | "hdd";
}

export function useDiskManagement(props: DiskManagementProps = {}) {
  const { onSelectDisk } = props;
  
  // Estado local desacoplado do localStorage para evitar carregamento automático de discos
  const [selectedDiskType, setSelectedDiskType] = useState<"nvme" | "ssd" | "hdd" | undefined>(undefined);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisks, setSelectedDisks] = useState<Array<{disk: PricedDiskOption, quantity: number}>>([]);
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);
  const [isPersisted, setIsPersisted] = useState(true);
  
  // Usar as ações de gerenciamento de disco com todos os parâmetros necessários
  const { 
    handleTypeSelect,
    handleCapacitySelect,
    handleQuantityChange,
    handleRemoveDisk
  } = useDiskActions({
    setSelectedDiskType,
    setSelectedCapacity,
    selectedDisks,
    setSelectedDisks,
    availableDisks,
    setIsPersisted,
    onSelectDisk
  });
  
  // Filtrar discos visíveis com base no tipo selecionado
  const visibleDisks = selectedDisks.filter(
    item => selectedDiskType ? item.disk.type === selectedDiskType : true
  );
  
  return {
    selectedDiskType,
    setSelectedDiskType,
    selectedCapacity,
    setSelectedCapacity,
    selectedDisks,
    setSelectedDisks,
    availableDisks,
    setAvailableDisks,
    visibleDisks,
    handleTypeSelect,
    handleCapacitySelect,
    handleQuantityChange,
    handleRemoveDisk
  };
}
