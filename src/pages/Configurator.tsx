
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  ServerConfiguration, 
  ServerConfigStep, 
  ALL_STEPS, 
  PricingDetails
} from "@/types/server-config";
import { ConfigWizard } from "@/components/configurator/ConfigWizard";
import { ConfigSummary } from "@/components/configurator/ConfigSummary";

const emptyConfig: ServerConfiguration = {
  location: null,
  cpu: null,
  chassis: null,
  memory: {
    option: null,
    quantity: 0
  },
  disks: [],
  raid: {
    enabled: false,
    option: null
  },
  iopsBlocks: [],
  bandwidth: 0,
  ddosProtection: false,
  contract: null
};

export default function Configurator() {
  const [currentStep, setCurrentStep] = useState<ServerConfigStep>('location');
  const [config, setConfig] = useState<ServerConfiguration>(emptyConfig);
  const [pricing, setPricing] = useState<PricingDetails>({
    baseTotal: 0,
    margin: 25, // Default margin 25%
    finalTotal: 0
  });
  const [isComplete, setIsComplete] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Calculate pricing whenever configuration changes
  useEffect(() => {
    calculatePricing();
  }, [config]);
  
  const calculatePricing = () => {
    let baseTotal = 0;
    
    // CPU
    if (config.cpu) {
      baseTotal += config.cpu.price;
    }
    
    // Chassis
    if (config.chassis) {
      baseTotal += config.chassis.price;
    }
    
    // Memory
    if (config.memory.option) {
      baseTotal += config.memory.option.price * config.memory.quantity;
    }
    
    // Disks
    config.disks.forEach(disk => {
      baseTotal += disk.option.price * disk.quantity;
    });
    
    // IOPs blocks
    config.iopsBlocks.forEach(block => {
      baseTotal += block.option.pricePerBlock * block.quantity;
    });
    
    // Bandwidth - R$18 per Mbps
    baseTotal += config.bandwidth * 18;
    
    // Calculate final total with margin
    const finalTotal = baseTotal * (1 + (pricing.margin / 100));
    
    setPricing({
      ...pricing,
      baseTotal,
      finalTotal
    });
  };
  
  const handleNextStep = () => {
    const currentIndex = ALL_STEPS.indexOf(currentStep);
    if (currentIndex < ALL_STEPS.length - 1) {
      setCurrentStep(ALL_STEPS[currentIndex + 1]);
    } else {
      setIsComplete(true);
    }
  };
  
  const handlePrevStep = () => {
    const currentIndex = ALL_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(ALL_STEPS[currentIndex - 1]);
    }
  };
  
  const handleStepChange = (step: ServerConfigStep) => {
    setCurrentStep(step);
  };
  
  const handleUpdateConfig = (updates: Partial<ServerConfiguration>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };
  
  const handleUpdateMargin = (margin: number) => {
    setPricing(prev => ({ ...prev, margin }));
    calculatePricing();
  };
  
  const handleSaveQuote = () => {
    toast({
      title: "Cotação salva",
      description: "Sua configuração foi salva com sucesso."
    });
  };
  
  const handleExportPDF = () => {
    toast({
      title: "Exportando PDF",
      description: "O PDF da sua configuração está sendo gerado."
    });
  };
  
  const handleFinishOrder = () => {
    toast({
      title: "Pedido finalizado",
      description: "Seu pedido de servidor foi enviado com sucesso!"
    });
    // In a real app, you would submit the order to a backend here
    navigate("/");
  };
  
  const handleRestart = () => {
    setConfig(emptyConfig);
    setCurrentStep('location');
    setIsComplete(false);
  };

  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Configurador de Servidor Dedicado</h1>
      
      {!isComplete ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6 rounded-2xl">
              <ConfigWizard
                currentStep={currentStep}
                config={config}
                onUpdateConfig={handleUpdateConfig}
                onNextStep={handleNextStep}
                onPrevStep={handlePrevStep}
              />
            </Card>
          </div>
          
          <div>
            <ConfigSummary
              config={config}
              pricing={pricing}
              currentStep={currentStep}
              onUpdateMargin={handleUpdateMargin}
              onChangeStep={handleStepChange}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onComplete={() => setIsComplete(true)}
            />
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 rounded-2xl">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Resumo da sua configuração</h2>
                <p className="text-muted-foreground">Revise os detalhes do seu servidor personalizado.</p>
              </div>
              
              <div className="divide-y divide-border">
                {config.location && (
                  <div className="py-4">
                    <h3 className="font-medium">Localização do Data Center</h3>
                    <p className="text-muted-foreground">{config.location.name}</p>
                  </div>
                )}
                
                {config.cpu && (
                  <div className="py-4">
                    <h3 className="font-medium">CPU</h3>
                    <p>{config.cpu.model} - {config.cpu.cores} núcleos, {config.cpu.ghz}GHz</p>
                  </div>
                )}
                
                {config.chassis && (
                  <div className="py-4">
                    <h3 className="font-medium">Chassi</h3>
                    <p>{config.chassis.model} - {config.chassis.description}</p>
                  </div>
                )}
                
                {config.memory.option && (
                  <div className="py-4">
                    <h3 className="font-medium">Memória</h3>
                    <p>{config.memory.quantity}x {config.memory.option.size}GB {config.memory.option.type}</p>
                  </div>
                )}
                
                {config.disks.length > 0 && (
                  <div className="py-4">
                    <h3 className="font-medium">Discos</h3>
                    <ul className="space-y-1 mt-2">
                      {config.disks.map((disk, index) => (
                        <li key={index}>
                          {disk.quantity}x {disk.option.size}GB {disk.option.type} {disk.option.brand}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {config.raid.enabled && config.raid.option && (
                  <div className="py-4">
                    <h3 className="font-medium">RAID</h3>
                    <p>RAID {config.raid.option.type}</p>
                  </div>
                )}
                
                {config.bandwidth > 0 && (
                  <div className="py-4">
                    <h3 className="font-medium">Banda</h3>
                    <p>{config.bandwidth} Mbps</p>
                  </div>
                )}
                
                {config.contract && (
                  <div className="py-4">
                    <h3 className="font-medium">Contrato</h3>
                    <p>{config.contract.months} meses (Payback: {config.contract.payback} meses)</p>
                  </div>
                )}
                
                <div className="py-6">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Subtotal:</span>
                    <span>R$ {pricing.baseTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Margem ({pricing.margin}%):</span>
                    <span>R$ {(pricing.finalTotal - pricing.baseTotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-primary">Total:</span>
                    <span className="text-primary">R$ {pricing.finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <Button onClick={handleFinishOrder} className="flex-1">
                  Finalizar Pedido
                </Button>
                <Button variant="outline" onClick={handleSaveQuote} className="flex-1">
                  Salvar Cotação
                </Button>
                <Button variant="outline" onClick={handleExportPDF} className="flex-1">
                  Exportar PDF
                </Button>
              </div>
              
              <div className="text-center">
                <Button variant="ghost" onClick={handleRestart}>
                  Configurar Novo Servidor
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
