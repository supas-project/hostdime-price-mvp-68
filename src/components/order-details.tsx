
import { ComponentOption } from "@/data/server-components";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { HelpTooltip } from "./help-tooltip";
import { Separator } from "@/components/ui/separator";

interface OrderDetailsProps {
  selectedComponents: { [key: string]: ComponentOption };
  margin?: number;
}

export function OrderDetails({ selectedComponents, margin = 25 }: OrderDetailsProps) {
  const subtotal = Object.values(selectedComponents).reduce(
    (sum, component) => sum + component.price,
    0
  );
  
  const profit = (subtotal * margin) / 100;
  const total = subtotal + profit;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Componentes Selecionados */}
      <Card>
        <CardHeader>
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
            {Object.entries(selectedComponents).map(([type, component]) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{component.name}</h4>
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                  </div>
                  <span className="font-medium text-primary">{formatCurrency(component.price)}</span>
                </div>
                {component.specs && (
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                    {component.specs.map((spec, index) => (
                      <li key={index} className="list-disc list-inside">
                        {spec}
                      </li>
                    ))}
                  </ul>
                )}
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
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
                <span className="text-muted-foreground">Subtotal</span>
                <HelpTooltip 
                  title="O que é isso?"
                  description="Valor base dos componentes selecionados, sem margem adicional"
                />
              </div>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2">
              <div className="space-y-1">
                <span className="text-muted-foreground">Margem ({margin}%)</span>
                <HelpTooltip 
                  title="O que é isso?"
                  description="Margem operacional aplicada sobre o valor base dos componentes"
                />
              </div>
              <span className="font-medium text-primary">{formatCurrency(profit)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center pt-2">
              <div className="space-y-1">
                <span className="text-lg font-medium">Total Mensal</span>
                <HelpTooltip 
                  title="O que é isso?"
                  description="Valor total mensal do seu servidor, incluindo todos os componentes e margem"
                />
              </div>
              <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
            
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
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
