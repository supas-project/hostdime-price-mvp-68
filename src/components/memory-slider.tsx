
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MemorySliderProps {
  value: number;
  onChange: (value: number) => void;
  pricePerGB: number;
}

export function MemorySlider({ value, onChange, pricePerGB }: MemorySliderProps) {
  // Lista de valores de memória disponíveis
  const memoryValues = [8, 16, 32, 64, 128, 256, 512, 1024];
  
  // Busca o índice do valor atual na lista
  const [currentIndex, setCurrentIndex] = useState(() => {
    const index = memoryValues.indexOf(value);
    return index !== -1 ? index : 0;
  });
  
  // Atualiza o índice quando o valor muda externamente
  useEffect(() => {
    const index = memoryValues.indexOf(value);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [value]);
  
  // Garante que um valor padrão seja usado se o valor atual não estiver na lista
  useEffect(() => {
    if (value === undefined || memoryValues.indexOf(value) === -1) {
      onChange(memoryValues[currentIndex]);
    }
  }, []);
  
  // Manipula a alteração do slider
  const handleSliderChange = (newValue: number[]) => {
    if (Array.isArray(newValue) && newValue.length > 0) {
      const index = newValue[0];
      if (index >= 0 && index < memoryValues.length) {
        setCurrentIndex(index);
        onChange(memoryValues[index]);
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
