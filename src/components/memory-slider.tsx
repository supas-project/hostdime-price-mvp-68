
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";
import { useEffect } from "react";

interface MemorySliderProps {
  value: number;
  onChange: (value: number) => void;
  pricePerGB: number;
}

export function MemorySlider({ value, onChange, pricePerGB }: MemorySliderProps) {
  const memoryValues = [8, 16, 32, 64, 128, 256, 512, 1024];
  const currentIndex = memoryValues.indexOf(value);
  
  // Garante que um valor padrão seja usado se o valor atual não estiver na lista
  useEffect(() => {
    if (currentIndex === -1 && memoryValues.length > 0) {
      onChange(memoryValues[0]);
    }
  }, []);
  
  const handleSliderChange = (newValue: number[]) => {
    onChange(memoryValues[newValue[0]]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium">{value}GB RAM</span>
        <span className="text-lg font-medium text-primary">
          {formatCurrency(value * pricePerGB)}
        </span>
      </div>
      
      <Slider
        value={[currentIndex !== -1 ? currentIndex : 0]}
        onValueChange={handleSliderChange}
        max={memoryValues.length - 1}
        step={1}
        className="my-4"
      />
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>8GB</span>
        <span>1TB</span>
      </div>
    </div>
  );
}
