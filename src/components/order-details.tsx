import { ComponentOption } from "@/types/component";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { HelpTooltip } from "./help-tooltip";
import { Separator } from "@/components/ui/separator";
import { Check, Shield, Wifi } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";
import { cn } from "@/lib/utils";
import { CustomService } from "@/types/wizard";
import { formatPayBack, getPayBackValue } from "@/utils/payback-utils";
import { usePayBackCalculation } from "@/hooks/usePayBackCalculation";

interface OrderDetailsProps {
  selectedComponents: { [key: string]: ComponentOption };
  margin?: number;
  onRemoveItem?: (type: string) => void; // Adicionando prop para remoção de itens
}

export function OrderDetails({ selectedComponents, margin = 25, onRemoveItem }: OrderDetailsProps) {
  const { storageItems, customServices, connectivityItems, handleRemoveComponent } = useWizard();
  const { calculatePriceWithPayBack } = usePayBackCalculation();

  // Separate DataCenter and Contract components
  const dataCenterComponent = selectedComponents["datacenter"];
  const contractComponent = selectedComponents["contrato"];
  const contractDuration = contractComponent?.subtype || "0";
  
  // Filter non-storage components and handle OS price calculation
  const otherComponents = Object.values(selectedComponents).filter(
    component => {
      // Skip storage components and components without prices
      if (component.type === "Armazenamento") return false;
      if (component.type === "DataCenter" || component.type === "Contrato") return false;
      
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

  // Calculate prices with PayBack for hardware components
  const nonStoragePrice = otherComponents.reduce(
    (sum, component) => {
      // Apply PayBack for hardware components
      const price = component.isHardware 
        ? calculatePriceWithPayBack(component, contractDuration)
        : component.price;
        
      return sum + price;
    },
    0
  );
  
  // Apply PayBack to internal storage
  const internalStoragePrice = storageItems.internal
    .filter(disk => disk && disk.price > 0)
    .reduce(
      (sum, disk) => {
        const price = disk.isHardware 
          ? calculatePriceWithPayBack(disk, contractDuration)
          : disk.price;
          
        return sum + price;
      },
      0
    );
  
  // Apply PayBack to external storage
  const externalStoragePrice = storageItems.external
    .filter(storage => storage && storage.price > 0)
    .reduce(
      (sum, storage) => {
        const price = storage.isHardware 
          ? calculatePriceWithPayBack(storage, contractDuration)
          : storage.price;
          
        return sum + price;
      },
      0
    );
  
  // Calculate other prices normally (non-hardware components)
  const customServicesPrice = customServices.reduce(
    (sum, service) => sum + service.price,
    0
  );
  
  // Make sure we have valid connectivity items before accessing their properties
  const connectivityPrice = Object.values(connectivityItems)
    .filter(item => item && typeof item === 'object' && 'option' in item && 'quantity' in item)
    .reduce((sum, item) => sum + ((item as {option: ComponentOption, quantity: number}).option.price * 
                                  (item as {option: ComponentOption, quantity: number}).quantity), 0);
  
  // Calculate final totals
  const subtotal = nonStoragePrice + internalStoragePrice + externalStoragePrice + customServicesPrice + connectivityPrice;
  const profit = (subtotal * margin) / 100;
  const total = subtotal + profit;

  // Handler para remoção de itens
  const handleRemoveItem = (type: string) => {
    if (onRemoveItem) {
      onRemoveItem(type);
    } else if (handleRemoveComponent) {
      handleRemoveComponent(type);
    }
  };

  // Helper function to render PayBack badge for hardware components
  const renderPayBackBadge = (component: ComponentOption) => {
    if (component.isHardware && contractComponent) {
      const paybackValue = getPayBackValue(component, contractDuration);
      if (paybackValue) {
        return (
          <span className="ml-1 text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full">
            PayBack {formatPayBack(paybackValue)}
          </span>
        );
      }
    }
    return null;
  };

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
            {/* Data Center and Contract first */}
            {dataCenterComponent && (
              <div className="space-y-2 hover:bg-muted/30 p-2 rounded-lg transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium flex items-center">
                      {dataCenterComponent.name}
                      <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {dataCenterComponent.type}
                      </span>
                    </h4>
                    <p className="text-sm text-muted-foreground">{dataCenterComponent.description}</p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Incluído</span>
                </div>
                {dataCenterComponent.metadata?.features && (
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4 mt-2">
                    {dataCenterComponent.metadata.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-primary mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Separator className="mt-4" />
              </div>
            )}

            {contractComponent && (
              <div className="space-y-2 hover:bg-muted/30 p-2 rounded-lg transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium flex items-center">
                      {contractComponent.name}
                      <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {contractComponent.type}
                      </span>
                    </h4>
                    <p className="text-sm text-muted-foreground">{contractComponent.description}</p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Incluído</span>
                </div>
                {contractComponent.metadata?.discount && (
                  <div className="mt-2 text-sm text-green-500 flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    Desconto de {contractComponent.metadata.discount}% incluído
                  </div>
                )}
                <Separator className="mt-4" />
              </div>
            )}

            {/* Other regular components */}
            {otherComponents.map((component) => (
              <div key={component.id} className="space-y-2 hover:bg-muted/30 p-2 rounded-lg transition-colors group">
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
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary">{formatCurrency(component.price)}</span>
                    
                    {onRemoveItem && (
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveItem(component.type.toLowerCase())}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                        <span className="sr-only">Remover {component.name}</span>
                      </button>
                    )}
                  </div>
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
            {(storageItems.internal.length > 0 || storageItems.external.length > 0) && (
              <div className="space-y-4">
                <h3 className="font-medium text-primary/80">Armazenamento</h3>
                
                {/* Internal storage disks */}
                {storageItems.internal.length > 0 && (
                  <>
                    <h4 className="text-sm font-medium">Discos Internos</h4>
                    {storageItems.internal.map((disk) => (
                      <div key={disk.id} className="space-y-2 hover:bg-muted/30 p-2 rounded-lg transition-colors group">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {disk.metadata?.quantity && disk.metadata.quantity > 1 ? `${disk.metadata.quantity}x ` : ''}{disk.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">{disk.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-primary">
                              {formatCurrency(disk.price)}
                            </span>
                            
                            {onRemoveItem && (
                              <button
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveItem(disk.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                                  <path d="M18 6 6 18"></path>
                                  <path d="m6 6 12 12"></path>
                                </svg>
                                <span className="sr-only">Remover disco</span>
                              </button>
                            )}
                          </div>
                        </div>
                        {disk.specs && (
                          <ul className="text-sm text-muted-foreground space-y-1 pl-4 mt-2">
                            {disk.specs.map((spec, index) => (
                              <li key={index} className="flex items-center">
                                <Check className="h-4 w-4 text-primary mr-2" />
                                <span>{spec}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {/* RAID Configuration */}
                        {disk.metadata?.raid && disk.metadata.raid.type !== 'none' && (
                          <div className="mt-2 p-2 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-primary" />
                              <h4 className="text-sm font-medium">Configuração RAID</h4>
                            </div>
                            <div className="mt-2 text-sm space-y-1">
                              <p className="text-muted-foreground">
                                RAID {disk.metadata.raid.type} - {disk.metadata.raid.description}
                              </p>
                              <p className={cn(
                                "text-xs",
                                disk.metadata.raid.type === 'none' ? "text-destructive" : "text-green-500"
                              )}>
                                {disk.metadata.raid.protection}
                              </p>
                              <div className="text-xs text-muted-foreground mt-1">
                                <p>Capacidade útil: {(disk.metadata.raid.usableCapacity || 0).toFixed(0)}GB</p>
                                <p>Tipo: {disk.metadata.raid.isHardware ? 'Hardware RAID' : 'Software RAID'}</p>
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
                {storageItems.external.filter(storage => storage && storage.price > 0).length > 0 && (
                  <>
                    <h4 className="text-sm font-medium">Storage Externo</h4>
                    {storageItems.external.filter(storage => storage && storage.price > 0).map((storage) => (
                      <div key={storage.id} className="space-y-2 hover:bg-muted/30 p-2 rounded-lg transition-colors group">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium flex items-center">
                              {storage.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">{storage.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-primary">{formatCurrency(storage.price)}</span>
                            
                            {onRemoveItem && (
                              <button
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveItem(storage.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                                  <path d="M18 6 6 18"></path>
                                  <path d="m6 6 12 12"></path>
                                </svg>
                                <span className="sr-only">Remover storage</span>
                              </button>
                            )}
                          </div>
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
            
            {/* Connectivity Items */}
            {Object.keys(connectivityItems).length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-primary/80">Conectividade</h3>
                {Object.entries(connectivityItems)
                  .filter(([_, item]) => item && typeof item === 'object' && 'option' in item)
                  .map(([itemId, itemData]) => {
                    // Type assertion to access option and quantity safely
                    const item = itemData as {option: ComponentOption, quantity: number};
                    
                    return (
                      <div key={itemId} className="space-y-2 hover:bg-muted/30 p-2 rounded-lg transition-colors group">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              <Wifi className="h-4 w-4 text-primary" />
                              {item.quantity > 1 ? `${item.quantity}x ${item.option.name}` : item.option.name}
                              <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                                {item.option.subtype === "porta" ? "Porta de Rede" : "IP"}
                              </span>
                            </h4>
                            <p className="text-sm text-muted-foreground">{item.option.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-primary">{formatCurrency(item.option.price * item.quantity)}</span>
                            
                            {onRemoveItem && (
                              <button
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveItem(itemId)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                                  <path d="M18 6 6 18"></path>
                                  <path d="m6 6 12 12"></path>
                                </svg>
                                <span className="sr-only">Remover item</span>
                              </button>
                            )}
                          </div>
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    );
                  })}
              </div>
            )}
            
            {/* Custom Services */}
            {customServices.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-primary/80">Serviços Personalizados</h3>
                {customServices
                  .filter(service => service && typeof service === 'object')
                  .map((service) => (
                    <div key={service.id} className="space-y-2 hover:bg-muted/30 p-2 rounded-lg transition-colors group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {service.name}
                            {service.metadata?.quantity && service.metadata.quantity > 1 && <span>({service.metadata.quantity}x)</span>}
                          </h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary">{formatCurrency(service.price)}</span>
                          
                          {onRemoveItem && (
                            <button
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveItem(service.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                              </svg>
                              <span className="sr-only">Remover serviço</span>
                            </button>
                          )}
                        </div>
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
                  Hardware & Software
                  <HelpTooltip 
                    title="O que é isso?"
                    description="Valor dos componentes de hardware e software selecionados"
                  />
                </span>
              </div>
              <span className="font-medium">{formatCurrency(nonStoragePrice)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center">
                  Armazenamento
                  <HelpTooltip 
                    title="O que é isso?"
                    description="Valor total das soluções de armazenamento"
                  />
                </span>
              </div>
              <span className="font-medium">{formatCurrency(internalStoragePrice + externalStoragePrice)}</span>
            </div>
            
            {/* Nova seção para exibir o preço da conectividade */}
            {connectivityPrice > 0 && (
              <div className="flex justify-between items-center pb-2">
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center">
                    Conectividade
                    <HelpTooltip 
                      title="O que é isso?"
                      description="Valor das portas de rede e blocos de IP"
                    />
                  </span>
                </div>
                <span className="font-medium">{formatCurrency(connectivityPrice)}</span>
              </div>
            )}
            
            {customServicesPrice > 0 && (
              <div className="flex justify-between items-center pb-2">
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center">
                    Serviços
                    <HelpTooltip 
                      title="O que é isso?"
                      description="Valor dos serviços adicionais contratados"
                    />
                  </span>
                </div>
                <span className="font-medium">{formatCurrency(customServicesPrice)}</span>
              </div>
            )}
            
            <Separator />
            
            {/* Removed margin display, showing only final price */}
            <div className="flex justify-between items-center pt-2">
              <div className="space-y-1">
                <span className="text-lg font-medium flex items-center">
                  Total Mensal
                  <HelpTooltip 
                    title="O que é isso?"
                    description="Valor total mensal do seu servidor"
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
