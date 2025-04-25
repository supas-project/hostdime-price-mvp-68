
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface MemorySliderProps {
  value: number;
  onChange: (value: number) => void;
  pricePerGB: number;
}

export function MemorySlider({ value, onChange, pricePerGB }: MemorySliderProps) {
  const memoryValues = [8, 16, 32, 64, 128, 256, 512, 1024];
  const [currentValue, setCurrentValue] = useState(value);
  
  useEffect(() => {
    if (!memoryValues.includes(value)) {
      const closest = memoryValues.reduce((prev, curr) => {
        return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
      });
      console.log("Adjusting invalid memory value:", value, "to:", closest);
      setCurrentValue(closest);
      onChange(closest);
      toast.error(`Valor de memória inválido. Ajustado para ${closest}GB`);
    } else {
      setCurrentValue(value);
    }
  }, [value]);

  const currentIndex = memoryValues.indexOf(currentValue);
  const calculatedPrice = currentValue * pricePerGB;
  
  const handleSliderChange = (newValue: number[]) => {
    if (Array.isArray(newValue) && newValue.length > 0) {
      const index = newValue[0];
      if (index >= 0 && index < memoryValues.length) {
        const newMemoryValue = memoryValues[index];
        console.log("Setting new memory value:", newMemoryValue);
        setCurrentValue(newMemoryValue);
        onChange(newMemoryValue);
        toast.success(`Memória ajustada para ${newMemoryValue}GB`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium">{currentValue}GB RAM</span>
        <span className="text-lg font-medium text-primary">
          {formatCurrency(calculatedPrice)}
        </span>
      </div>
      
      <Slider
        value={[currentIndex]}
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
