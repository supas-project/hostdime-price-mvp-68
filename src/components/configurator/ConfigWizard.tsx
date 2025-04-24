
import { ServerConfigStep, ServerConfiguration } from "@/types/server-config";
import { LocationStepForm } from "./steps/LocationStepForm";
import { CPUStepForm } from "./steps/CPUStepForm";
import { ChassisStepForm } from "./steps/ChassisStepForm";
import { MemoryStepForm } from "./steps/MemoryStepForm";
import { DiskStepForm } from "./steps/DiskStepForm";
import { RaidStepForm } from "./steps/RaidStepForm";
import { IOPsStepForm } from "./steps/IOPsStepForm";
import { BandwidthStepForm } from "./steps/BandwidthStepForm";
import { DDoSStepForm } from "./steps/DDoSStepForm";
import { ContractStepForm } from "./steps/ContractStepForm";
import { Progress } from "@/components/ui/progress";
import { ALL_STEPS } from "@/types/server-config";

interface ConfigWizardProps {
  currentStep: ServerConfigStep;
  config: ServerConfiguration;
  onUpdateConfig: (updates: Partial<ServerConfiguration>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export function ConfigWizard({
  currentStep,
  config,
  onUpdateConfig,
  onNextStep,
  onPrevStep
}: ConfigWizardProps) {
  const progress = ((ALL_STEPS.indexOf(currentStep) + 1) / ALL_STEPS.length) * 100;
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 'location':
        return <LocationStepForm 
                 selectedLocation={config.location}
                 onUpdateLocation={(location) => onUpdateConfig({ location })}
                 onNext={onNextStep} 
               />;
      case 'cpu':
        return <CPUStepForm 
                 selectedCPU={config.cpu}
                 onUpdateCPU={(cpu) => onUpdateConfig({ cpu })}
                 onNext={onNextStep} 
                 onPrev={onPrevStep} 
               />;
      case 'chassis':
        return <ChassisStepForm 
                 selectedCPU={config.cpu}
                 selectedChassis={config.chassis}
                 onUpdateChassis={(chassis) => onUpdateConfig({ chassis })}
                 onNext={onNextStep} 
                 onPrev={onPrevStep} 
               />;
      case 'memory':
        return <MemoryStepForm 
                 selectedChassis={config.chassis}
                 memoryConfig={config.memory}
                 onUpdateMemory={(memory) => onUpdateConfig({ memory })}
                 onNext={onNextStep} 
                 onPrev={onPrevStep} 
               />;
      case 'disks':
        return <DiskStepForm 
                 selectedChassis={config.chassis}
                 disks={config.disks}
                 onUpdateDisks={(disks) => onUpdateConfig({ disks })}
                 onNext={onNextStep} 
                 onPrev={onPrevStep} 
               />;
      case 'raid':
        return <RaidStepForm 
                 raidConfig={config.raid}
                 disks={config.disks}
                 onUpdateRaid={(raid) => onUpdateConfig({ raid })}
                 onNext={onNextStep} 
                 onPrev={onPrevStep} 
               />;
      case 'iops':
        return <IOPsStepForm 
                 iopsBlocks={config.iopsBlocks}
                 onUpdateIOPs={(iopsBlocks) => onUpdateConfig({ iopsBlocks })}
                 onNext={onNextStep} 
                 onPrev={onPrevStep} 
               />;
      case 'bandwidth':
        return <BandwidthStepForm 
                 bandwidth={config.bandwidth}
                 onUpdateBandwidth={(bandwidth) => onUpdateConfig({ bandwidth })}
                 onNext={onNextStep} 
                 onPrev={onPrevStep} 
               />;
      case 'ddos':
        return <DDoSStepForm 
                 ddosProtection={config.ddosProtection}
                 onUpdateDDoS={(ddosProtection) => onUpdateConfig({ ddosProtection })}
                 onNext={onNextStep} 
                 onPrev={onPrevStep} 
               />;
      case 'contract':
        return <ContractStepForm 
                 selectedContract={config.contract}
                 onUpdateContract={(contract) => onUpdateConfig({ contract })}
                 onComplete={onNextStep} 
                 onPrev={onPrevStep} 
               />;
      default:
        return <div>Etapa não reconhecida</div>;
    }
  };

  const stepTitles: Record<ServerConfigStep, string> = {
    location: "Localização do Data Center",
    cpu: "Processador (CPU)",
    chassis: "Chassi / Placa-Mãe",
    memory: "Memória RAM",
    disks: "Discos de Armazenamento",
    raid: "Configuração de RAID",
    iops: "Blocos de IOPs",
    bandwidth: "Largura de Banda",
    ddos: "Proteção DDoS",
    contract: "Contrato"
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{stepTitles[currentStep]}</h2>
          <span className="text-sm text-muted-foreground">
            Etapa {ALL_STEPS.indexOf(currentStep) + 1} de {ALL_STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="py-4">
        {renderStepContent()}
      </div>
    </div>
  );
}
