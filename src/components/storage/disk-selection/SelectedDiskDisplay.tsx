import { Button } from "@/components/ui/button";
import { CircleDot, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PricedDiskOption } from "@/types/storage";
import { QuantitySelector } from "@/components/quantity-selector";
import { SimpleRaidCalculator } from "@/components/storage/raid/SimpleRaidCalculator";
import { RaidType } from "@/types/raid";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { normalizeStorageCapacity } from "@/utils/storage-utils";

interface SelectedDiskDisplayProps {
  disk: PricedDiskOption;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function SelectedDiskDisplay({ 
  disk, 
  quantity, 
  onQuantityChange, 
  onRemove 
}: SelectedDiskDisplayProps) {
  const [raidType, setRaidType] = useState<RaidType>("none");
  const [isHardwareRaid, setIsHardwareRaid] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setShowRaidConfig(quantity >= 2);
    if (quantity < 2 && raidType !== "none") {
      setRaidType("none");
      toast.warning("RAID desativado: quantidade insuficiente de discos");
    }
  }, [quantity, raidType]);

  const handleRaidTypeChange = (type: RaidType, isHardware: boolean) => {
    setRaidType(type);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (raidType !== "none" && newQuantity < 2) {
      toast.warning("RAID será desativado ao reduzir a quantidade de discos");
    }
    onQuantityChange(newQuantity);
  };

  const diskTypeColors = {
    nvme: "bg-green-500/20 text-green-600 border-green-500/30",
    ssd: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    hdd: "bg-amber-500/20 text-amber-600 border-amber-500/30"
  };
  
  // Normalizar a capacidade do disco para garantir consistência na exibição
  const normalizedCapacity = normalizeStorageCapacity(disk.capacity);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between p-3 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] transition-all duration-300">
        <div className="flex items-center gap-3">
          <CircleDot className="w-4 h-4 text-[#f58220]" />
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={diskTypeColors[disk.type]}>
              {disk.type.toUpperCase()}
            </Badge>
            <span className="text-white">{normalizedCapacity}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white">Quantidade:</span>
            <QuantitySelector 
              value={quantity} 
              onChange={handleQuantityChange} 
              min={1} 
              max={10} 
            />
          </div>
          <span className="text-[#f58220] font-medium">
            {formatCurrency(disk.price * quantity)}/mês
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="ml-2 text-destructive hover:text-destructive/90"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showRaidConfig && (
        <div className="animate-fade-in">
          <SimpleRaidCalculator
            selectedDisk={disk}
            quantity={quantity}
            onRaidTypeChange={handleRaidTypeChange}
          />
        </div>
      )}
    </div>
  );
}
