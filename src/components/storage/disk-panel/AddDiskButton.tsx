
import { Button } from "@/components/ui/button";

interface AddDiskButtonProps {
  selectedCapacity: string;
  selectedDiskType: "nvme" | "ssd" | "hdd" | undefined;
  handleAddSelectedDisk: () => void;
}

export function AddDiskButton({
  selectedCapacity,
  selectedDiskType,
  handleAddSelectedDisk
}: AddDiskButtonProps) {
  if (!selectedCapacity || !selectedDiskType) return null;

  return (
    <div className="mt-4">
      <Button 
        onClick={handleAddSelectedDisk}
        className="w-full bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-[#f5822060] text-white"
      >
        <span>Configurar disco {selectedDiskType.toUpperCase()}</span>
      </Button>
    </div>
  );
}
