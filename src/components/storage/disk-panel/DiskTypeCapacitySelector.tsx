
import { DiskTypeSelector } from "../disk-selection/DiskTypeSelector";
import { DiskCapacitySelector } from "../disk-selection/DiskCapacitySelector";
import { PricedDiskOption } from "@/types/storage";

interface DiskTypeCapacitySelectorProps {
  selectedDiskType: "nvme" | "ssd" | "hdd" | undefined;
  selectedCapacity: string;
  handleTypeSelect: (type: "nvme" | "ssd" | "hdd") => void;
  handleCapacitySelect: (capacity: string) => void;
  availableDisks: PricedDiskOption[];
  isLoading: boolean;
}

export function DiskTypeCapacitySelector({
  selectedDiskType,
  selectedCapacity,
  handleTypeSelect,
  handleCapacitySelect,
  availableDisks,
  isLoading
}: DiskTypeCapacitySelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <DiskTypeSelector
        selectedType={selectedDiskType}
        onTypeSelect={handleTypeSelect}
      />
      <DiskCapacitySelector
        selectedCapacity={selectedCapacity}
        onCapacitySelect={handleCapacitySelect}
        availableDisks={availableDisks}
        disabled={!selectedDiskType || isLoading}
        isLoading={isLoading}
      />
    </div>
  );
}
