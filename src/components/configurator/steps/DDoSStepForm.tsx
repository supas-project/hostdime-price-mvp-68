
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, ArrowLeft, Shield, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DDoSStepFormProps {
  ddosProtection: boolean;
  onUpdateDDoS: (enabled: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function DDoSStepForm({
  ddosProtection,
  onUpdateDDoS,
  onNext,
  onPrev
}: DDoSStepFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg">Proteção DDoS</p>
        <p className="text-muted-foreground text-sm mt-1">
          Adicione proteção contra ataques de negação de serviço.
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  A proteção DDoS (Distributed Denial of Service) ajuda a manter seu servidor online 
                  mesmo durante ataques maliciosos que tentam sobrecarregar sua infraestrutura.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="ddos-toggle" className="flex flex-col gap-1">
              <span>Ativar Proteção DDoS</span>
              <span className="font-normal text-sm text-muted-foreground">
                Proteção contra ataques de negação de serviço
              </span>
            </Label>
            <Switch
              id="ddos-toggle"
              checked={ddosProtection}
              onCheckedChange={onUpdateDDoS}
            />
          </div>
          
          {ddosProtection && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">Proteção DDoS Ativada</p>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li>• Proteção contra até 10 Gbps de tráfego malicioso</li>
                  <li>• Mitigação automática de ataques</li>
                  <li>• Monitoramento em tempo real</li>
                  <li>• Relatórios detalhados de incidentes</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={onPrev}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={onNext}>
          Próximo
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
