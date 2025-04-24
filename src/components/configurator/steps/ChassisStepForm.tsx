import { ChassisOption, CPUOption } from "@/types/server-config";
import { 
  Card, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Server, HardDrive, MemoryStick, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import { CollapsibleConfigSection } from "../CollapsibleConfigSection";

interface ChassisStepFormProps {
  selectedCPU: CPUOption | null;
  selectedChassis: ChassisOption | null;
  onUpdateChassis: (chassis: ChassisOption) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Dados mockados de Chassis
const chassisOptions: ChassisOption[] = [
  {
    id: "chassis-1",
    model: "Dell PowerEdge R240",
    description: "Servidor básico 1U",
    memoryType: "DDR4",
    memorySlots: 2,
    diskSlots: 4,
    cpuCompatibility: ["cpu-1", "cpu-2"],
    price: 1200
  },
  {
    id: "chassis-2",
    model: "Dell PowerEdge R340",
    description: "Servidor intermediário 1U",
    memoryType: "DDR4",
    memorySlots: 4,
    diskSlots: 8,
    cpuCompatibility: ["cpu-1", "cpu-2", "cpu-3"],
    price: 1800
  },
  {
    id: "chassis-3",
    model: "Dell PowerEdge R440",
    description: "Servidor avançado 1U",
    memoryType: "DDR4",
    memorySlots: 16,
    diskSlots: 10,
    cpuCompatibility: ["cpu-2", "cpu-3", "cpu-4"],
    price: 2400
  },
  {
    id: "chassis-4",
    model: "Dell PowerEdge R540",
    description: "Servidor premium 2U",
    memoryType: "DDR4",
    memorySlots: 16,
    diskSlots: 24,
    cpuCompatibility: ["cpu-3", "cpu-4"],
    price: 3600
  }
];

export function ChassisStepForm({
  selectedCPU,
  selectedChassis,
  onUpdateChassis,
  onNext,
  onPrev
}: ChassisStepFormProps) {
  // Filtra os chassis compatíveis com a CPU selecionada
  const compatibleChassis = chassisOptions.filter(chassis => 
    selectedCPU && chassis.cpuCompatibility.includes(selectedCPU.id)
  );
  
  return (
    <div className="space-y-6">
      {compatibleChassis.map((chassis) => (
        <CollapsibleConfigSection
          key={chassis.id}
          title={chassis.model}
          description={chassis.description}
          icon={<Server className="h-5 w-5" />}
          defaultOpen={selectedChassis?.id === chassis.id}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <MemoryStick className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm">{chassis.memorySlots} slots de memória</span>
              </div>
              <div className="flex items-center">
                <HardDrive className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm">{chassis.diskSlots} slots de disco</span>
              </div>
              <div className="text-sm">{chassis.memoryType}</div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-bold text-primary">{formatCurrency(chassis.price)}</span>
              <Button onClick={() => onUpdateChassis(chassis)}>
                {selectedChassis?.id === chassis.id ? "Selecionado" : "Selecionar"}
              </Button>
            </div>
          </div>
        </CollapsibleConfigSection>
      ))}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={onNext} disabled={!selectedChassis}>
          Próximo
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
