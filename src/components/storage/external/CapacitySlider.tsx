
import { Slider } from "@/components/ui/slider";
import { HelpTooltip } from "@/components/help-tooltip";

interface CapacitySliderProps {
  capacity: number;
  onCapacityChange: (value: number) => void;
}

export function CapacitySlider({ capacity, onCapacityChange }: CapacitySliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium flex items-center gap-2">
          Capacidade
          <HelpTooltip
            title="Capacidade do Storage"
            description="Ajuste a capacidade do seu storage externo conforme sua necessidade"
          />
        </label>
        <span className="font-medium text-primary">{capacity} GB</span>
      </div>
      <Slider
        value={[capacity]}
        onValueChange={([value]) => onCapacityChange(value)}
        min={100}
        max={2000}
        step={100}
        className="my-4"
      />
    </div>
  );
}
