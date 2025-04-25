
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MemorySliderProps {
  value: number;
  onChange: (value: number) => void;
  pricePerGB: number;
}

export function MemorySlider({ value, onChange, pricePerGB }: MemorySliderProps) {
  const memoryValues = [8, 16, 32, 64, 128, 256, 512, 1024];
  
  const [currentIndex, setCurrentIndex] = useState(() => {
    const index = memoryValues.indexOf(value);
    return index !== -1 ? index : 0;
  });
  
  // Atualiza o valor quando o índice muda
  useEffect(() => {
    const newValue = memoryValues[currentIndex];
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [currentIndex, value, onChange]);
  
  // Atualiza o índice quando o valor muda externamente
  useEffect(() => {
    const index = memoryValues.indexOf(value);
    if (index !== -1 && index !== currentIndex) {
      setCurrentIndex(index);
    }
  }, [value]);

  const handleSliderChange = (newValue: number[]) => {
    if (Array.isArray(newValue) && newValue.length > 0) {
      const index = newValue[0];
      if (index >= 0 && index < memoryValues.length) {
        setCurrentIndex(index);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium">{memoryValues[currentIndex]}GB RAM</span>
        <span className="text-lg font-medium text-primary">
          {formatCurrency(memoryValues[currentIndex] * pricePerGB)}
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
