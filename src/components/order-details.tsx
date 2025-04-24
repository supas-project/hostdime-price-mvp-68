
import { ComponentOption } from "@/data/server-components";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { HelpTooltip } from "./help-tooltip";

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
  
  const specs = Object.values(selectedComponents).flatMap(
    component => component.specs || []
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            Especificações Técnicas
            <HelpTooltip 
              title="Detalhes"
              description="Especificações técnicas completas do seu servidor"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {specs.map((spec, index) => (
              <li key={index} className="flex items-center gap-2 text-muted-foreground">
                • {spec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            Resumo Financeiro
            <HelpTooltip 
              title="Detalhes"
              description="Detalhamento dos valores do seu servidor"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground flex items-center gap-2">
                Margem ({margin}%)
                <HelpTooltip 
                  title="Margem"
                  description="Margem de lucro aplicada sobre o valor base"
                />
              </span>
              <span className="font-medium text-primary">{formatCurrency(profit)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-medium">Total Mensal</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
