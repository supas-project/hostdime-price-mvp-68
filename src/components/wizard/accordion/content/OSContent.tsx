
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { OSSelector } from "./os/OSSelector";

interface OSContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function OSContent({
  options,
  selectedOption,
  onSelectOption
}: OSContentProps) {
  return (
    <Card className="p-6">
      <OSSelector
        options={options}
        selectedOption={selectedOption}
        onSelectOption={onSelectOption}
      />
    </Card>
  );
}
