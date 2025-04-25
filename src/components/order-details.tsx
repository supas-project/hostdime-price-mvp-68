
import { ComponentOption } from "@/types/component";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { HelpTooltip } from "./help-tooltip";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";

interface OrderDetailsProps {
  selectedComponents: { [key: string]: ComponentOption };
  margin?: number;
}

export function OrderDetails({ selectedComponents, margin = 25 }: OrderDetailsProps) {
  const { storageItems } = useWizard();
  
  // Filter non-storage components
  const nonStorageComponents = Object.values(selectedComponents).filter(
    component => component.type !== "Armazenamento"
  );

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
  
  const subtotal = nonStoragePrice + internalStoragePrice + externalStoragePrice;
  const profit = (subtotal * margin) / 100;
  const total = subtotal + profit;

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
            {(storageItems.internal.length > 0 || storageItems.external.length > 0) && (
              <div className="space-y-4">
                <h3 className="font-medium text-primary/80">Armazenamento</h3>
                
                {/* Internal storage disks */}
                {storageItems.internal.length > 0 && (
                  <>
                    <h4 className="text-sm font-medium">Discos Internos</h4>
                    {storageItems.internal.map((disk) => (
                      <div key={disk.id} className="space-y-2 hover:bg-muted/30 p-2 rounded-lg transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium flex items-center">
                              {disk.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">{disk.description}</p>
                          </div>
                          <span className="font-medium text-primary">{formatCurrency(disk.price)}</span>
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
