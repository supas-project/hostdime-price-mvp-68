
import { PricedDiskOption } from "@/types/storage";
import { DiskTypeCapacitySelector } from "./DiskTypeCapacitySelector";
import { SelectedDiskTypeInfo } from "../disk-selection/SelectedDiskTypeInfo";
import { AddDiskButton } from "./AddDiskButton";
import { SelectedDisksDisplay } from "./SelectedDisksDisplay";
import { OtherDisksDisplay } from "../disk-selection/OtherDisksDisplay";
import { DiskSelectionArea } from "../disk-selection/DiskSelectionArea";

interface DiskPanelContentProps {
  selectedDiskType: "nvme" | "ssd" | "hdd" | undefined;
  selectedCapacity: string;
  handleTypeSelect: (type: "nvme" | "ssd" | "hdd") => void;
  handleCapacitySelect: (capacity: string) => void;
  handleAddSelectedDisk: () => void;
  availableDisks: PricedDiskOption[];
  isLoading: boolean;
  showLoadingOrNoDiskMessage: boolean;
  visibleDisks: { disk: PricedDiskOption; quantity: number }[];
  selectedDisks: { disk: PricedDiskOption; quantity: number }[];
  handleQuantityChange: (diskId: string, quantity: number) => void;
  handleRemoveDisk: (diskId: string) => void;
}

export function DiskPanelContent({
  selectedDiskType,
  selectedCapacity,
  handleTypeSelect,
  handleCapacitySelect,
  handleAddSelectedDisk,
  availableDisks,
  isLoading,
  showLoadingOrNoDiskMessage,
  visibleDisks,
  selectedDisks,
  handleQuantityChange,
  handleRemoveDisk
}: DiskPanelContentProps) {
  return (
    <div className="space-y-6">
      <DiskTypeCapacitySelector
        selectedDiskType={selectedDiskType}
        selectedCapacity={selectedCapacity}
        handleTypeSelect={handleTypeSelect}
        handleCapacitySelect={handleCapacitySelect}
        availableDisks={availableDisks}
        isLoading={isLoading}
      />

      {selectedDiskType && (
        <SelectedDiskTypeInfo selectedDiskType={selectedDiskType} />
      )}

      <AddDiskButton
        selectedCapacity={selectedCapacity}
        selectedDiskType={selectedDiskType}
        handleAddSelectedDisk={handleAddSelectedDisk}
      />

      {showLoadingOrNoDiskMessage ? (
        <DiskSelectionArea 
          showLoadingOrNoDiskMessage={showLoadingOrNoDiskMessage} 
          isLoading={isLoading} 
          selectedDiskType={selectedDiskType}
          visibleDisks={visibleDisks}
          selectedDisks={selectedDisks}
          onQuantityChange={handleQuantityChange}
          onRemoveDisk={handleRemoveDisk}
        />
      ) : (
        <SelectedDisksDisplay 
          visibleDisks={visibleDisks}
          handleQuantityChange={handleQuantityChange}
          handleRemoveDisk={handleRemoveDisk}
        />
      )}
      
      <OtherDisksDisplay 
        selectedDisks={selectedDisks}
        selectedDiskType={selectedDiskType}
        onSelectDiskType={handleTypeSelect}
      />
    </div>
  );
}
