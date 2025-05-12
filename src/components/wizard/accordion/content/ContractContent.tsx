
import { ComponentSelector } from "@/components/component-selector";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPayBack, getPayBackValue } from "@/utils/payback-utils";

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
    }
  };

  // Get the PayBack value for the current contract
  const paybackValue = selectedOption ? getPayBackValue({ isHardware: true } as ComponentOption, selectedOption.subtype || "0") : null;

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
      
      {selectedOption && (
        <div className="mt-4 p-3 bg-primary/5 rounded-md">
          <div className="flex flex-wrap gap-2 items-center">
            {selectedOption.metadata?.discount && selectedOption.metadata?.discount > 0 ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                {selectedOption.metadata.discount}% de desconto
              </Badge>
            ) : null}
            
            {paybackValue && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                PayBack: {formatPayBack(paybackValue)} para hardware
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            {paybackValue ? 
              `Com este contrato, você obtém ${formatPayBack(paybackValue)} de PayBack em componentes de hardware.` : 
              "Selecione um contrato para ver os benefícios."}
          </p>
        </div>
      )}
    </Card>
  );
}
