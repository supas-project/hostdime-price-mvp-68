
import { SelectedDiskDisplay } from "../SelectedDiskDisplay";
import { PricedDiskOption } from "@/types/storage";

interface DiskListProps {
  visibleDisks: { disk: PricedDiskOption; quantity: number }[];
  onQuantityChange: (diskId: string, quantity: number) => void;
  onRemoveDisk: (diskId: string) => void;
}

export function DiskList({ 
  visibleDisks, 
  onQuantityChange, 
  onRemoveDisk 
}: DiskListProps) {
  return (
    <div className="space-y-4">
      {visibleDisks.map((item) => (
        <div key={item.disk.id} className="animate-fade-in">
          <SelectedDiskDisplay
            disk={item.disk}
            quantity={item.quantity}
            onQuantityChange={(qty) => onQuantityChange(item.disk.id, qty)}
            onRemove={() => onRemoveDisk(item.disk.id)}
          />
        </div>
      ))}
    </div>
  );
}
