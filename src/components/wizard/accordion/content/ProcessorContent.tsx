
import { ComponentSelector } from "@/components/component-selector";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";

interface ProcessorContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function ProcessorContent({ 
  options, 
  selectedOption, 
  onSelectOption 
}: ProcessorContentProps) {
  return (
    <Card className="p-6">
      <ComponentSelector
        label="Processador"
        options={options}
        value={selectedOption?.id || ""}
        onChange={(value) => {
          const option = options.find(opt => opt.id === value);
          if (option) onSelectOption(option);
        }}
        tooltip="Escolha o processador ideal para seu servidor"
        highlightSelection={true}
      />
    </Card>
  );
}
