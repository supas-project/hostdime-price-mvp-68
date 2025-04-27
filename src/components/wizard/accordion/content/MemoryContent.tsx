
import { ComponentOption } from "@/types/component";
import { HelpTooltip } from "@/components/help-tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";

interface MemoryContentProps {
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function MemoryContent({ selectedOption, onSelectOption }: MemoryContentProps) {
  const memoryValues = [64, 128, 256, 512, 768, 1024];
  const pricePerGB = 7.5;

  const getMemorySpecs = (memorySize: number) => ({
    type: memorySize >= 512 ? "DDR4 ECC Load Reduced DIMM" : "DDR4 ECC Registered",
    speed: "3200 MHz",
    channels: "Quad Channel",
    ecc: "Error Correction Code (ECC)",
    bandwidth: memorySize >= 512 ? "Alta performance com otimização para grandes volumes" : "Performance ideal para cargas de trabalho padrão"
  });

  const formatMemorySize = (size: number): string => {
    return size >= 1024 ? `${size / 1024}TB` : `${size}GB`;
  };

  const createMemoryOption = (memorySize: number): ComponentOption => ({
    id: `memory-${memorySize}`,
    type: "memoria",
    name: `${formatMemorySize(memorySize)} RAM`,
    description: `Memória RAM ${getMemorySpecs(memorySize).type}`,
    price: memorySize * pricePerGB,
    specs: [
      `${formatMemorySize(memorySize)} Total`,
      `Tipo: ${getMemorySpecs(memorySize).type}`,
      `Velocidade: ${getMemorySpecs(memorySize).speed}`,
      getMemorySpecs(memorySize).channels,
      getMemorySpecs(memorySize).ecc
    ]
  });

  useEffect(() => {
    if (!selectedOption) {
      onSelectOption(createMemoryOption(64));
    }
  }, []);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base font-medium">Memória RAM</h3>
        <HelpTooltip
          title="Memória RAM"
          description="A quantidade de memória RAM afeta diretamente o desempenho do servidor para executar múltiplas tarefas e aplicações simultaneamente."
          iconOnly
        />
      </div>

      <Select
        value={selectedOption?.id || ""}
        onValueChange={(value) => {
          const memorySize = parseInt(value.replace('memory-', ''));
          onSelectOption(createMemoryOption(memorySize));
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione a quantidade de memória RAM" />
        </SelectTrigger>
        <SelectContent>
          {memoryValues.map((size) => {
            const specs = getMemorySpecs(size);
            const formattedSize = formatMemorySize(size);
            
            return (
              <SelectItem
                key={size}
                value={`memory-${size}`}
                className="flex items-center justify-between group py-3"
              >
                <div className="flex items-center justify-between w-full gap-4">
                  <div className="flex items-center gap-2">
                    <span>{formattedSize} RAM</span>
                    <HelpTooltip
                      title={`${formattedSize} RAM`}
                      description={`
                        • Tipo: ${specs.type}
                        • Velocidade: ${specs.speed}
                        • ${specs.channels}
                        • ${specs.ecc}
                        • ${specs.bandwidth}
                      `}
                      iconOnly
                    />
                  </div>
                  <span className="text-primary font-medium">
                    {formatCurrency(size * pricePerGB)}
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </Card>
  );
}
