
import { useState } from "react";
import { 
  ServerConfiguration, 
  ServerConfigStep, 
  PricingDetails,
  ALL_STEPS 
} from "@/types/server-config";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Check, Edit } from "lucide-react";

interface ConfigSummaryProps {
  config: ServerConfiguration;
  pricing: PricingDetails;
  currentStep: ServerConfigStep;
  onUpdateMargin: (margin: number) => void;
  onChangeStep: (step: ServerConfigStep) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onComplete: () => void;
}

export function ConfigSummary({
  config,
  pricing,
  currentStep,
  onUpdateMargin,
  onChangeStep,
  onNextStep,
  onPrevStep,
  onComplete
}: ConfigSummaryProps) {
  const [isEditingMargin, setIsEditingMargin] = useState(false);
  const [marginValue, setMarginValue] = useState(pricing.margin.toString());
  
  const isFirstStep = currentStep === ALL_STEPS[0];
  const isLastStep = currentStep === ALL_STEPS[ALL_STEPS.length - 1];
  
  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarginValue(e.target.value);
  };
  
  const handleApplyMargin = () => {
    const parsedValue = parseFloat(marginValue);
    if (!isNaN(parsedValue) && parsedValue >= 0) {
      onUpdateMargin(parsedValue);
    }
    setIsEditingMargin(false);
  };
  
  const canAdvance = () => {
    switch (currentStep) {
      case 'location':
        return !!config.location;
      case 'cpu':
        return !!config.cpu;
      case 'chassis':
        return !!config.chassis;
      case 'memory':
        return config.memory.option && config.memory.quantity > 0;
      case 'disks':
        return config.disks.length > 0;
      case 'raid':
        return true; // RAID is optional
      case 'iops':
        return true; // IOPs are optional
      case 'bandwidth':
        return config.bandwidth > 0;
      case 'ddos':
        return true; // DDoS protection is a yes/no choice
      case 'contract':
        return !!config.contract;
      default:
        return false;
    }
  };
  
  return (
    <Card className="sticky top-24 rounded-2xl">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex justify-between items-center">
          <span>Resumo</span>
          <span className="text-primary text-lg font-bold">
            {formatCurrency(pricing.finalTotal)}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="py-4 space-y-4 max-h-[400px] overflow-y-auto">
        {config.location && (
          <div className="flex justify-between items-start group">
            <div>
              <p className="text-sm font-medium">Data Center</p>
              <p className="text-xs text-muted-foreground">{config.location.name}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onChangeStep('location')}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {config.cpu && (
          <div className="flex justify-between items-start group">
            <div>
              <p className="text-sm font-medium">CPU</p>
              <p className="text-xs text-muted-foreground">
                {config.cpu.model} - {config.cpu.cores} núcleos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{formatCurrency(config.cpu.price)}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onChangeStep('cpu')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {config.chassis && (
          <div className="flex justify-between items-start group">
            <div>
              <p className="text-sm font-medium">Chassi</p>
              <p className="text-xs text-muted-foreground">
                {config.chassis.model}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{formatCurrency(config.chassis.price)}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onChangeStep('chassis')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {config.memory.option && (
          <div className="flex justify-between items-start group">
            <div>
              <p className="text-sm font-medium">Memória</p>
              <p className="text-xs text-muted-foreground">
                {config.memory.quantity}x {config.memory.option.size}GB {config.memory.option.type}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {formatCurrency(config.memory.option.price * config.memory.quantity)}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onChangeStep('memory')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {config.disks.length > 0 && (
          <div className="flex justify-between items-start group">
            <div>
              <p className="text-sm font-medium">Discos</p>
              <div className="text-xs text-muted-foreground space-y-1">
                {config.disks.map((disk, i) => (
                  <p key={i}>
                    {disk.quantity}x {disk.option.size}GB {disk.option.type}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {formatCurrency(
                  config.disks.reduce((sum, disk) => sum + disk.option.price * disk.quantity, 0)
                )}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onChangeStep('disks')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {config.raid.enabled && config.raid.option && (
          <div className="flex justify-between items-start group">
            <div>
              <p className="text-sm font-medium">RAID</p>
              <p className="text-xs text-muted-foreground">
                RAID {config.raid.option.type}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onChangeStep('raid')}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {config.iopsBlocks.length > 0 && (
          <div className="flex justify-between items-start group">
            <div>
              <p className="text-sm font-medium">Blocos IOPs</p>
              <div className="text-xs text-muted-foreground space-y-1">
                {config.iopsBlocks.map((block, i) => (
                  <p key={i}>
                    {block.quantity}x {block.option.type}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {formatCurrency(
                  config.iopsBlocks.reduce(
                    (sum, block) => sum + block.option.pricePerBlock * block.quantity, 
                    0
                  )
                )}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onChangeStep('iops')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {config.bandwidth > 0 && (
          <div className="flex justify-between items-start group">
            <div>
              <p className="text-sm font-medium">Banda</p>
              <p className="text-xs text-muted-foreground">
                {config.bandwidth} Mbps
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{formatCurrency(config.bandwidth * 18)}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onChangeStep('bandwidth')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {config.ddosProtection && (
          <div className="flex justify-between items-start group">
            <div>
              <p className="text-sm font-medium">Proteção DDoS</p>
              <p className="text-xs text-muted-foreground">
                Proteção ativada
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onChangeStep('ddos')}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {config.contract && (
          <div className="flex justify-between items-start group">
            <div>
              <p className="text-sm font-medium">Contrato</p>
              <p className="text-xs text-muted-foreground">
                {config.contract.months} meses
                {config.contract.payback > 0 && ` (Payback: ${config.contract.payback} meses)`}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onChangeStep('contract')}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
      
      <div className="border-t border-border p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Margem:</span>
            {isEditingMargin ? (
              <div className="flex items-center gap-1">
                <Input 
                  type="number" 
                  value={marginValue}
                  onChange={handleMarginChange}
                  className="w-16 h-7 text-sm p-1"
                />
                <span className="text-sm">%</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 px-2"
                  onClick={handleApplyMargin}
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2"
                onClick={() => setIsEditingMargin(true)}
              >
                {pricing.margin}%
              </Button>
            )}
          </div>
          <span className="text-sm font-medium">
            {formatCurrency(pricing.finalTotal - pricing.baseTotal)}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-border pt-2 mb-4">
          <span className="font-bold text-primary">Total:</span>
          <span className="font-bold text-xl text-primary">
            {formatCurrency(pricing.finalTotal)}
          </span>
        </div>
        
        <div className="space-y-3">
          {isLastStep ? (
            <Button
              className="w-full"
              onClick={onComplete}
              disabled={!canAdvance()}
            >
              Finalizar Configuração
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={onPrevStep}
                disabled={isFirstStep}
                className="flex items-center justify-center"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>
              <Button
                onClick={onNextStep}
                disabled={!canAdvance()}
                className="flex items-center justify-center"
              >
                Próximo
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
