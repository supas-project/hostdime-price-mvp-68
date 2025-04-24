
import { ChassisOption, CPUOption } from "@/types/server-config";
import { 
  Card, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Server, HardDrive, Memory, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";

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
      <div>
        <p className="text-lg">Escolha o chassi do servidor</p>
        <p className="text-muted-foreground text-sm mt-1">
          Selecione o modelo de chassi compatível com o processador escolhido.
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  O chassi determina o tamanho físico do servidor e a quantidade de componentes
                  que podem ser instalados, como memória e discos.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {compatibleChassis.map((chassis) => (
          <Card 
            key={chassis.id}
            className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              selectedChassis?.id === chassis.id 
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
            onClick={() => onUpdateChassis(chassis)}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium mb-1">{chassis.model}</h3>
                  <CardDescription>{chassis.description}</CardDescription>
                  
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <Memory className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{chassis.memorySlots} slots de memória</span>
                    </div>
                    <div className="flex items-center">
                      <HardDrive className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{chassis.diskSlots} slots de disco</span>
                    </div>
                    <div className="text-sm">{chassis.memoryType}</div>
                  </div>
                </div>
                
                <div className="font-bold text-primary">
                  {formatCurrency(chassis.price)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {compatibleChassis.length === 0 && (
        <div className="text-center py-8">
          <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum chassi compatível encontrado</p>
          <p className="text-muted-foreground mt-1">
            Volte e selecione outro processador para ver opções de chassi disponíveis.
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={onPrev}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
        <Button 
          onClick={onNext}
          disabled={!selectedChassis}
        >
          Próximo
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
