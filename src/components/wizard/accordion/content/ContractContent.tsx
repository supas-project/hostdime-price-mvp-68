
import { ComponentSelector } from "@/components/component-selector";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

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
      
      // Mostrar toast com informação sobre o desconto
      if (option.metadata?.discount) {
        toast.success(
          `Contrato de ${option.name} selecionado`, 
          { description: `Desconto de ${option.metadata.discount}% aplicado no valor final` }
        );
      } else {
        toast.info(`Contrato de ${option.name} selecionado`);
      }
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
