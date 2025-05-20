
import { DiskLoadingState } from "./loading-state/DiskLoadingState";
import { NoDiskFoundState } from "./loading-state/NoDiskFoundState";
import { DiskList } from "./disk-list/DiskList";
import { EmptyDiskState } from "./EmptyDiskState";
import { PricedDiskOption } from "@/types/storage";

interface DiskSelectionAreaProps {
  showLoadingOrNoDiskMessage: boolean;
  isLoading: boolean;
  selectedDiskType: "nvme" | "ssd" | "hdd" | undefined;
  visibleDisks: { disk: PricedDiskOption; quantity: number }[];
  selectedDisks: { disk: PricedDiskOption; quantity: number }[];
  onQuantityChange: (diskId: string, quantity: number) => void;
  onRemoveDisk: (diskId: string) => void;
}

export function DiskSelectionArea({ 
  showLoadingOrNoDiskMessage, 
  isLoading, 
  selectedDiskType,
  visibleDisks,
  selectedDisks,
  onQuantityChange,
  onRemoveDisk
}: DiskSelectionAreaProps) {
  if (showLoadingOrNoDiskMessage) {
    if (isLoading) {
      return <DiskLoadingState />;
    }
    
    return <NoDiskFoundState selectedDiskType={selectedDiskType} />;
  }
  
  if (visibleDisks.length > 0) {
    return (
      <DiskList 
        visibleDisks={visibleDisks}
        onQuantityChange={onQuantityChange}
        onRemoveDisk={onRemoveDisk}
      />
    );
  }
  
  return (
    <EmptyDiskState 
      selectedDiskType={selectedDiskType}
      selectedDisks={selectedDisks}
    />
  );
}
