import { ComponentOption } from "@/types/component";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { HelpTooltip } from "./help-tooltip";
import { Separator } from "@/components/ui/separator";
import { Check, Shield } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OrderDetailsProps {
  selectedComponents: { [key: string]: ComponentOption };
  margin?: number;
}

// Helper function to group internal disks by type and capacity
type GroupedDisk = {
  disk: ComponentOption;
  quantity: number;
};

const groupDisksByTypeAndCapacity = (disks: ComponentOption[]): GroupedDisk[] => {
  const diskGroups: { [key: string]: GroupedDisk } = {};
  
  disks.forEach(disk => {
    // Create a unique key based on disk type and capacity
    const typeMatch = disk.description?.match(/Disco interno: (\w+)/);
    const capacityMatch = disk.description?.match(/(\d+(?:\.\d+)?[GT]B)/);
    
    if (typeMatch && capacityMatch) {
      const diskType = typeMatch[1];
      const diskCapacity = capacityMatch[1];
      const key = `${diskType}-${diskCapacity}`;
      
      if (diskGroups[key]) {
        // Increment quantity for existing disk type
        diskGroups[key].quantity += 1;
      } else {
        // Create new group for this disk type
        diskGroups[key] = {
          disk: { ...disk },
          quantity: 1
        };
      }
    } else {
      // Fallback for disks that don't match the expected pattern
      const key = `disk-${disk.id}`;
      diskGroups[key] = { disk, quantity: 1 };
    }
  });
  
  return Object.values(diskGroups);
};

export function OrderDetails({ selectedComponents, margin = 25 }: OrderDetailsProps) {
  const { storageItems, customServices } = useWizard();
  
  // Filter non-storage components and handle OS price calculation
  const nonStorageComponents = Object.values(selectedComponents).filter(
    component => {
      if (component.type === "Armazenamento") return false;
      
      // Special handling for OS price calculation
      if (component.type === "SistemaOperacional" && component.metadata?.perCore) {
        const processorInfo = selectedComponents["processador"];
        const coreCount = processorInfo?.metadata?.cores || 1;
        const pairCount = Math.ceil(coreCount / 2);
        component.price = component.price * pairCount;
      }
      
      return true;
    }
  );

  // Group storage disks
  const groupedInternalDisks = groupDisksByTypeAndCapacity(storageItems.internal);
  
  // Calculate prices
  const nonStoragePrice = nonStorageComponents.reduce(
    (sum, component) => sum + component.price,
    0
  );
  
  const internalStoragePrice = storageItems.internal.reduce(
    (sum, disk) => sum + disk.price,
    0
  );
  
  const externalStoragePrice = storageItems.external.reduce(
    (sum, storage) => sum + storage.price,
    0
  );
  
  const customServicesPrice = customServices.reduce(
    (sum, service) => sum + service.price,
    0
  );
  
  const subtotal = nonStoragePrice + internalStoragePrice + externalStoragePrice + customServicesPrice;
  const profit = (subtotal * margin) / 100;
  const total = subtotal + profit;

  // Extract RAID info for internal disks
  const hasRaidConfiguration = storageItems.internal.some(disk => disk.metadata?.raid?.type !== 'none');
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center justify-between text-lg">
            Componentes Selecionados
            <HelpTooltip 
              title="Ver detalhes"
              description="Lista detalhada dos componentes escolhidos para seu servidor"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Regular components */}
            {nonStorageComponents.map((component) => (
              <div key={component.id} className="space-y-2 hover:bg-muted/30 p-2 rounded-lg transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium flex items-center">
                      {component.name}
                      <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {component.type}
                      </span>
                    </h4>
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                  </div>
                  <span className="font-medium text-primary">{formatCurrency(component.price)}</span>
                </div>
                {component.specs && (
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4 mt-2">
                    {component.specs.map((spec, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-primary mr-2" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Separator className="mt-4" />
              </div>
            ))}
            
            {/* Storage components section */}
            {(groupedInternalDisks.length > 0 || storageItems.external.length > 0) && (
              <div className="space-y-4">
                <h3 className="font-medium text-primary/80">Armazenamento</h3>
                
                {/* Internal storage disks - grouped */}
                {groupedInternalDisks.length > 0 && (
                  <>
                    <h4 className="text-sm font-medium">Discos Internos</h4>
                    {groupedInternalDisks.map((groupedDisk) => (
                      <div key={groupedDisk.disk.id} className="space-y-2 hover:bg-muted/30 p-2 rounded-lg transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {groupedDisk.quantity > 1 ? `${groupedDisk.quantity}x ` : ''}{groupedDisk.disk.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">{groupedDisk.disk.description}</p>
                          </div>
                          <span className="font-medium text-primary">
                            {formatCurrency(groupedDisk.disk.price * groupedDisk.quantity)}
                          </span>
                        </div>
                        {groupedDisk.disk.specs && (
                          <ul className="text-sm text-muted-foreground space-y-1 pl-4 mt-2">
                            {groupedDisk.disk.specs.map((spec, index) => (
                              <li key={index} className="flex items-center">
                                <Check className="h-4 w-4 text-primary mr-2" />
                                <span>{spec}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {/* RAID Configuration */}
                        {groupedDisk.disk.metadata?.raid && groupedDisk.disk.metadata.raid.type !== 'none' && (
                          <div className="mt-2 p-2 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-primary" />
                              <h4 className="text-sm font-medium">Configuração RAID</h4>
                            </div>
                            <div className="mt-2 text-sm space-y-1">
                              <p className="text-muted-foreground">
                                RAID {groupedDisk.disk.metadata.raid.type} - {groupedDisk.disk.metadata.raid.description}
                              </p>
                              <p className={cn(
                                "text-xs",
                                groupedDisk.disk.metadata.raid.type === 'none' ? "text-destructive" : "text-green-500"
                              )}>
                                {groupedDisk.disk.metadata.raid.protection}
                              </p>
                              <div className="text-xs text-muted-foreground mt-1">
                                <p>Capacidade útil: {groupedDisk.disk.metadata.raid.usableCapacity}GB</p>
                                <p>Tipo: {groupedDisk.disk.metadata.raid.isHardware ? 'Hardware RAID' : 'Software RAID'}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </>
                )}
                
                {/* External storage */}
                {storageItems.external.length > 0 && (
                  <>
                    <h4 className="text-sm font-medium">Storage Externo</h4>
                    {storageItems.external.map((storage) => (
                      <div key={storage.id} className="space-y-2 hover:bg-muted/30 p-2 rounded-lg transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium flex items-center">
                              {storage.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">{storage.description}</p>
                          </div>
                          <span className="font-medium text-primary">{formatCurrency(storage.price)}</span>
                        </div>
                        {storage.specs && (
                          <ul className="text-sm text-muted-foreground space-y-1 pl-4 mt-2">
                            {storage.specs.map((spec, index) => (
                              <li key={index} className="flex items-center">
                                <Check className="h-4 w-4 text-primary mr-2" />
                                <span>{spec}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
            
            {/* Custom Services */}
            {customServices.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-primary/80">Serviços Personalizados</h3>
                {customServices.map(service => (
                  <div key={service.id} className="space-y-2 hover:bg-muted/30 p-2 rounded-lg transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {service.name}
                          {service.metadata?.quantity > 1 && <span>({service.metadata.quantity}x)</span>}
                        </h4>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <span className="font-medium text-primary">{formatCurrency(service.price)}</span>
                    </div>
                    {service.specs && (
                      <ul className="text-sm text-muted-foreground space-y-1 pl-4 mt-2">
                        {service.specs.map((spec, index) => (
                          <li key={index} className="flex items-center">
                            <Check className="h-4 w-4 text-primary mr-2" />
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center justify-between text-lg">
            Resumo Financeiro
            <HelpTooltip 
              title="Ver detalhes"
              description="Detalhamento dos valores do seu servidor dedicado"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center">
                  Subtotal
                  <HelpTooltip 
                    title="O que é isso?"
                    description="Valor base dos componentes selecionados, sem margem adicional"
                  />
                </span>
              </div>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center">
                  Margem ({margin}%)
                  <HelpTooltip 
                    title="O que é isso?"
                    description="Margem operacional aplicada sobre o valor base dos componentes"
                  />
                </span>
              </div>
              <span className="font-medium text-primary">{formatCurrency(profit)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center pt-2">
              <div className="space-y-1">
                <span className="text-lg font-medium flex items-center">
                  Total Mensal
                  <HelpTooltip 
                    title="O que é isso?"
                    description="Valor total mensal do seu servidor, incluindo todos os componentes e margem"
                  />
                </span>
              </div>
              <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
            
            <div className="mt-4 p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                * Valores mensais, cobrados em reais (BRL). Impostos podem ser aplicados dependendo da região.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
