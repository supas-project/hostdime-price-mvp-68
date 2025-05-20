
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";

export function useDiskSelectionState(isInitialLoad: boolean) {
  // State for disk management - starting with undefined or empty values
  const [selectedDiskType, setSelectedDiskType] = useState<"nvme" | "ssd" | "hdd" | undefined>(undefined);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisks, setSelectedDisks] = useState<Array<{disk: PricedDiskOption, quantity: number}>>([]);
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);
  
  // NÃO restaurar discos selecionados automaticamente do local storage
  // Isso garante que o resumo inicie vazio

  // Calculate visible disks based on selected type
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
    visibleDisks
  };
}
