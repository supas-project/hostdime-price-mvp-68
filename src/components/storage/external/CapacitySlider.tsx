
import { Slider } from "@/components/ui/slider";
import { HelpTooltip } from "@/components/help-tooltip";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

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

  // Get size classification based on capacity
  const getSizeCategory = (): { label: string; variant: "secondary" | "success" | "default" } => {
    if (capacity <= 250) return { label: "Pequeno", variant: "secondary" };
    if (capacity <= 800) return { label: "Médio", variant: "default" };
    return { label: "Grande", variant: "success" };
  };

  const sizeCategory = getSizeCategory();

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

  // Quick capacity options based on common usage patterns
  const quickCapacityOptions = [
    { value: 100, label: "100GB" },
    { value: 500, label: "500GB" },
    { value: 1000, label: "1TB" },
    { value: 2000, label: "2TB" }
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Tamanho</label>
          <HelpTooltip
            title="Escolha o tamanho ideal"
            description="Defina quanto espaço de armazenamento você precisa."
          />
          <Badge variant={sizeCategory.variant} className="ml-1 text-xs">
            {sizeCategory.label}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <Input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyPress={handleKeyPress}
              className="w-24 h-8 text-right pr-8"
              min={min}
              max={max}
              step={step}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary font-medium">
              GB
            </div>
          </div>
        </div>
      </div>
      
      <Slider
        value={[capacity]}
        onValueChange={([value]) => onCapacityChange(value)}
        min={min}
        max={max}
        step={step}
      />
      
      <div className="grid grid-cols-4 gap-2">
        {quickCapacityOptions.map((option) => (
          <button 
            key={option.value}
            type="button"
            className={`text-xs py-1.5 px-2 rounded-md border transition-all duration-200 ${
              capacity === option.value 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-border hover:border-primary/30 hover:bg-primary/5'
            }`}
            onClick={() => onCapacityChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
