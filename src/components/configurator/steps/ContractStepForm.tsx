
import { ContractOption } from "@/types/server-config";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardDescription
} from "@/components/ui/card";
import { ArrowLeft, Check, HelpCircle, Calendar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mockContracts } from "@/services/priceService";

interface ContractStepFormProps {
  selectedContract: ContractOption | null;
  onUpdateContract: (contract: ContractOption) => void;
  onComplete: () => void;
  onPrev: () => void;
}

export function ContractStepForm({
  selectedContract,
  onUpdateContract,
  onComplete,
  onPrev
}: ContractStepFormProps) {
  const contracts = mockContracts;
  
  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg">Tipo de contrato</p>
        <p className="text-muted-foreground text-sm mt-1">
          Escolha o período de contrato para seu servidor.
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  Contratos de longo prazo oferecem melhores condições financeiras.
                  O "Payback" representa o prazo em que o valor pago já cobre o custo do equipamento.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contracts.map((contract) => (
          <Card 
            key={contract.id}
            className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              selectedContract?.id === contract.id 
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
            onClick={() => onUpdateContract(contract)}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">
                      {contract.months === 0 
                        ? "Indeterminado" 
                        : `${contract.months} meses`
                      }
                    </h3>
                    {selectedContract?.id === contract.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  
                  <CardDescription>
                    {contract.description}
                  </CardDescription>
                  
                  {contract.payback > 0 && (
                    <div className="mt-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">Payback: {contract.payback} meses</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={onPrev}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
        <Button 
          onClick={onComplete}
          disabled={!selectedContract}
        >
          Finalizar Configuração
        </Button>
      </div>
    </div>
  );
}
