
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";
import { HardDrive } from "lucide-react";

const STORAGE_TYPES = {
  standard: { name: "Standard", pricePerGB: 0.15, iops: "Até 1000", throughput: "Até 125 MB/s" },
  ssd: { name: "SSD", pricePerGB: 0.25, iops: "Até 3000", throughput: "Até 250 MB/s" },
  premium: { name: "Premium", pricePerGB: 0.35, iops: "Até 6000", throughput: "Até 500 MB/s" },
  nvme: { name: "NVMe", pricePerGB: 0.45, iops: "Até 10000", throughput: "Até 1000 MB/s" }
};

export function ExternalStoragePanel() {
  const [storageType, setStorageType] = useState<keyof typeof STORAGE_TYPES | "">("");
  const [capacityGB, setCapacityGB] = useState(100);

  const calculatePrice = () => {
    if (!storageType) return 0;
    return capacityGB * STORAGE_TYPES[storageType].pricePerGB;
  };

  return (
    <div className="space-y-6">
      <div>
        <Select onValueChange={(value: keyof typeof STORAGE_TYPES) => setStorageType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de storage" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STORAGE_TYPES).map(([key, type]) => (
              <SelectItem key={key} value={key}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {storageType && (
        <>
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Capacidade: {capacityGB} GB
            </label>
            <Slider
              value={[capacityGB]}
              onValueChange={([value]) => setCapacityGB(value)}
              min={100}
              max={2000}
              step={100}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>IOPS:</span>
              <span>{STORAGE_TYPES[storageType].iops}</span>
            </div>
            <div className="flex justify-between">
              <span>Throughput:</span>
              <span>{STORAGE_TYPES[storageType].throughput}</span>
            </div>
            <div className="flex justify-between font-medium text-primary">
              <span>Preço Mensal:</span>
              <span>{formatCurrency(calculatePrice())}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
