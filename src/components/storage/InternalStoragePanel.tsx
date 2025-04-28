import { useState } from "react";
import { diskData } from "@/data/disk-data";
import { PricedDiskOption } from "@/types/storage";
import { DiskTypeSelector } from "./disk-selection/DiskTypeSelector";
import { DiskCapacitySelector } from "./disk-selection/DiskCapacitySelector";
import { SelectedDiskDisplay } from "./disk-selection/SelectedDiskDisplay";
import { toast } from "sonner";

interface InternalStoragePanelProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function InternalStoragePanel({ onSelectDisk }: InternalStoragePanelProps) {
  const [selectedDiskType, setSelectedDiskType] = useState<"nvme" | "ssd" | "hdd" | undefined>(undefined);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisk, setSelectedDisk] = useState<PricedDiskOption | null>(null);
  const [quantity, setQuantity] = useState(1);

  const availableDisks = selectedDiskType ? diskData.filter(disk => disk.type === selectedDiskType) : [];

  const handleCapacitySelect = (capacity: string) => {
    setSelectedCapacity(capacity);
    const disk = selectedDiskType && diskData.find(d => d.type === selectedDiskType && d.capacity === capacity);
    if (disk) {
      setSelectedDisk(disk);
      setQuantity(1);
      if (onSelectDisk) {
        onSelectDisk(disk, 1);
      }
    }
  };

  const handleTypeSelect = (type: "nvme" | "ssd" | "hdd") => {
    setSelectedDiskType(type);
    // Only reset capacity, keep the disk type selected
    setSelectedCapacity("");
    if (selectedDisk) {
      handleRemoveDisk(); // Clean up previous selection
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    if (selectedDisk && onSelectDisk) {
      onSelectDisk(selectedDisk, newQuantity);
    }
  };

  const handleRemoveDisk = () => {
    if (selectedDisk && onSelectDisk) {
      // Envia um disco com preço 0 para sinalizar remoção
      onSelectDisk({
        ...selectedDisk,
        price: 0
      }, 0);

      // Limpa apenas o disco selecionado e capacidade, mantém o tipo
      setSelectedCapacity("");
      setSelectedDisk(null);
      setQuantity(1);

      toast.success("Disco removido com sucesso");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <DiskTypeSelector
          selectedType={selectedDiskType}
          onTypeSelect={handleTypeSelect}
        />
        <DiskCapacitySelector
          selectedCapacity={selectedCapacity}
          onCapacitySelect={handleCapacitySelect}
          availableDisks={availableDisks}
          disabled={!selectedDiskType}
        />
      </div>

      {selectedDisk && (
        <div className="animate-fade-in">
          <SelectedDiskDisplay
            disk={selectedDisk}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveDisk}
          />
        </div>
      )}
    </div>
  );
}
