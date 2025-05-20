
import { useDiskManagementLegacy } from './useDiskManagementLegacy';
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
  
  // Usar as ações de gerenciamento de disco
  const { 
    handleQuantityChange,
    handleRemoveDisk,
    handleAddDisk,
  } = useDiskActions({
    selectedDisks,
    setSelectedDisks,
    onSelectDisk
  });
  
  // Função para selecionar tipo de disco
  const handleTypeSelect = (type: "nvme" | "ssd" | "hdd") => {
    setSelectedDiskType(type);
    // Limpar capacidade selecionada quando o tipo muda
    setSelectedCapacity("");
  };
  
  // Função para selecionar capacidade
  const handleCapacitySelect = (capacity: string) => {
    setSelectedCapacity(capacity);
  };
  
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
    visibleDisks,
    handleTypeSelect,
    handleCapacitySelect,
    handleQuantityChange,
    handleRemoveDisk,
    handleAddDisk
  };
}
