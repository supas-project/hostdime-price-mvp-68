
import { Slider } from "@/components/ui/slider";
import { HelpTooltip } from "@/components/help-tooltip";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  min = 1,
  max = 512000, // 500TB em GB
  step = 1
}: CapacitySliderProps) {
  const [inputValue, setInputValue] = useState<string>(capacity.toString());

  // Função para formatar a capacidade
  const formatCapacity = (capacityGB: number): string => {
    if (capacityGB >= 1024) {
      const tbValue = capacityGB / 1024;
      return `${tbValue % 1 === 0 ? tbValue : tbValue.toFixed(1)}TB`;
    }
    return `${capacityGB}GB`;
  };

  // Get size classification based on capacity
  const getSizeCategory = (): { label: string; variant: "secondary" | "success" | "default" } => {
    if (capacity <= 100) return { label: "Pequeno", variant: "secondary" };
    if (capacity <= 10240) return { label: "Médio", variant: "default" }; // até 10TB
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
    { value: 1024, label: "1TB" },
    { value: 5120, label: "5TB" },
    { value: 10240, label: "10TB" },
    { value: 51200, label: "50TB" }
  ];

  return (
    <div className="space-y-3 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <label className="text-xs sm:text-sm font-medium">Tamanho</label>
          <HelpTooltip
            title="Escolha o tamanho ideal"
            description="Defina quanto espaço de armazenamento você precisa (1GB até 500TB)."
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
          <div className="text-xs sm:text-sm font-medium text-primary">
            {formatCapacity(capacity)}
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
