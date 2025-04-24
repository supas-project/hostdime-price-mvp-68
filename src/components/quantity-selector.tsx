
import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({ value, onChange, min = 0, max = 999 }: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrease}
        disabled={value <= min}
      >
        <MinusIcon className="h-4 w-4" />
      </Button>
      <span className="w-12 text-center text-lg font-medium">{value}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrease}
        disabled={value >= max}
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
