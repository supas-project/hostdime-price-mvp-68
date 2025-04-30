
import { ComponentSelector } from "@/components/component-selector";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";

interface ContractContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function ContractContent({ 
  options, 
  selectedOption, 
  onSelectOption 
}: ContractContentProps) {
  const handleOptionChange = (value: string) => {
    const option = options.find(opt => opt.id === value);
    if (option) {
      onSelectOption(option);
      
      // Removido todos os toasts de seleção de contrato
    }
  };

  return (
    <Card className="p-6">
      <ComponentSelector
        label="Duração do Contrato"
        options={options}
        value={selectedOption?.id || ""}
        onChange={handleOptionChange}
        tooltip="Escolha o período do seu contrato"
        highlightSelection={true}
      />
    </Card>
  );
}
