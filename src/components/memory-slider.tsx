
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface MemorySliderProps {
  value: number;
  onChange: (value: number) => void;
  pricePerGB: number;
}

export function MemorySlider({ value, onChange, pricePerGB }: MemorySliderProps) {
  const memoryValues = [8, 16, 32, 64, 128, 256, 512, 1024];
  
  const currentIndex = memoryValues.indexOf(value);
  
  const handleSliderChange = (newValue: number[]) => {
    if (Array.isArray(newValue) && newValue.length > 0) {
      const index = newValue[0];
      if (index >= 0 && index < memoryValues.length) {
        onChange(memoryValues[index]);
      }
    }
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
