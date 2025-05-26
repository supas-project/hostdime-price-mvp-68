
import { Slider } from "@/components/ui/slider";
import { HelpTooltip } from "@/components/help-tooltip";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MemoryCapacitySelectorProps {
  capacity: number;
  onCapacityChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function MemoryCapacitySelector({ 
  capacity, 
  onCapacityChange,
  min = 8,
  max = 512,
  step = 8
}: MemoryCapacitySelectorProps) {
  const [inputValue, setInputValue] = useState<string>(capacity.toString());

  // Get size classification based on capacity
  const getSizeCategory = (): { label: string; variant: "secondary" | "success" | "default" } => {
    if (capacity <= 16) return { label: "Básico", variant: "secondary" };
    if (capacity <= 64) return { label: "Intermediário", variant: "default" };
    return { label: "Avançado", variant: "success" };
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
    { value: 8, label: "8GB" },
    { value: 16, label: "16GB" },
    { value: 32, label: "32GB" },
    { value: 64, label: "64GB" },
    { value: 128, label: "128GB" },
    { value: 256, label: "256GB" }
  ];

  return (
    <div className="space-y-3 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <label className="text-xs sm:text-sm font-medium">Capacidade</label>
          <HelpTooltip
            title="Escolha a capacidade ideal"
            description="Defina a quantidade de memória RAM necessária para suas aplicações."
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
              className="w-24 sm:w-28 h-8 text-right pr-8 text-xs sm:text-sm"
              min={min}
              max={max}
              step={step}
              placeholder="GB"
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
        className="py-1"
      />
      
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {quickCapacityOptions.map((option) => (
          <button 
            key={option.value}
            type="button"
            className={cn(
              "text-xs py-1.5 px-2 rounded-md border transition-all duration-200",
              capacity === option.value 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-border hover:border-primary/30 hover:bg-primary/5'
            )}
            onClick={() => onCapacityChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
