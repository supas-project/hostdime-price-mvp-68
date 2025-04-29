
import { Slider } from "@/components/ui/slider";
import { HelpTooltip } from "@/components/help-tooltip";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface CapacitySliderProps {
  capacity: number;
  onCapacityChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function CapacitySlider({ 
  capacity, 
  onCapacityChange,
  min = 100,
  max = 2000,
  step = 100
}: CapacitySliderProps) {
  const [inputValue, setInputValue] = useState<string>(capacity.toString());

  // Update input value when capacity prop changes
  useEffect(() => {
    setInputValue(capacity.toString());
  }, [capacity]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Update capacity when input is blurred
  const handleInputBlur = () => {
    const newCapacity = parseInt(inputValue);
    if (!isNaN(newCapacity) && newCapacity >= min && newCapacity <= max) {
      // Round to nearest step
      const roundedCapacity = Math.round(newCapacity / step) * step;
      onCapacityChange(roundedCapacity);
    } else {
      // Reset to current capacity if invalid
      setInputValue(capacity.toString());
    }
  };

  // Handle keypress (Enter key)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium flex items-center gap-2">
          Capacidade
          <HelpTooltip
            title="Capacidade do Storage"
            description="Ajuste a capacidade do seu storage externo conforme sua necessidade. Quanto maior a capacidade, maior o espaço disponível para seus dados."
          />
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            className="w-20 h-8 text-right"
            min={min}
            max={max}
            step={step}
          />
          <span className="font-medium text-primary">GB</span>
        </div>
      </div>
      <Slider
        value={[capacity]}
        onValueChange={([value]) => onCapacityChange(value)}
        min={min}
        max={max}
        step={step}
        className="my-4"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min} GB</span>
        <span>{max} GB</span>
      </div>
    </div>
  );
}
