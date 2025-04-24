
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, ArrowLeft, Wifi, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";

interface BandwidthStepFormProps {
  bandwidth: number;
  onUpdateBandwidth: (bandwidth: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function BandwidthStepForm({
  bandwidth,
  onUpdateBandwidth,
  onNext,
  onPrev
}: BandwidthStepFormProps) {
  const [inputValue, setInputValue] = useState(bandwidth.toString());
  
  const handleSliderChange = (value: number[]) => {
    const newBandwidth = value[0];
    setInputValue(newBandwidth.toString());
    onUpdateBandwidth(newBandwidth);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue) && parsedValue >= 0) {
      onUpdateBandwidth(parsedValue);
    }
  };
  
  const bandwidthCost = bandwidth * 18; // R$18 por Mbps
  const bandwidthTiers = [10, 100, 250, 500, 1000];
  
  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg">Largura de banda</p>
        <p className="text-muted-foreground text-sm mt-1">
          Configure a largura de banda para seu servidor.
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  A largura de banda determina a velocidade de conexão do seu servidor com a internet.
                  Quanto maior a largura de banda, mais dados podem ser transmitidos simultaneamente.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Label htmlFor="bandwidth">Mbps:</Label>
              <div className="flex items-center">
                <Input
                  id="bandwidth"
                  type="number"
                  min="1"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="w-24"
                />
                <span className="ml-2">Mbps</span>
              </div>
            </div>
            
            <Slider
              defaultValue={[bandwidth]}
              max={1000}
              min={10}
              step={10}
              value={[bandwidth]}
              onValueChange={handleSliderChange}
              className="py-4"
            />
            
            <div className="flex justify-between text-sm text-muted-foreground">
              {bandwidthTiers.map((tier) => (
                <div 
                  key={tier} 
                  className="text-center cursor-pointer"
                  onClick={() => {
                    setInputValue(tier.toString());
                    onUpdateBandwidth(tier);
                  }}
                >
                  <div className={`h-1 w-1 rounded-full mx-auto mb-1 ${
                    bandwidth >= tier ? 'bg-primary' : 'bg-muted-foreground'
                  }`} />
                  <span>{tier} Mbps</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-full">
                <Wifi className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">{bandwidth} Mbps</p>
                <p className="text-sm text-muted-foreground">Largura de banda dedicada</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor mensal</p>
              <p className="font-bold text-primary text-xl">{formatCurrency(bandwidthCost)}</p>
            </div>
          </div>
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
        <Button 
          onClick={onNext}
          disabled={bandwidth <= 0}
        >
          Próximo
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
