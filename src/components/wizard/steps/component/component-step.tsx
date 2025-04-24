
import { ComponentOption } from "@/data/server-components";
import { ComponentCard } from "@/components/component-card";

interface ComponentStepProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
  componentType: string;
}

export function ComponentStep({
  options,
  selectedOption,
  onSelectOption,
  componentType
}: ComponentStepProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {options.map((option) => (
        <ComponentCard
          key={option.id}
          option={option}
          isSelected={selectedOption?.id === option.id}
          onSelect={onSelectOption}
          componentType={componentType}
        />
      ))}
    </div>
  );
}
