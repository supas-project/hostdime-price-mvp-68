
import { useState } from "react";
import { ComponentOption } from "@/data/server-components";
import { Button } from "@/components/ui/button";
import { FileText, Save, ArrowRight, FileDown, Settings } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Slider
} from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface SelectedComponents {
  [key: string]: ComponentOption;
}

interface FinalSummaryProps {
  selectedComponents: SelectedComponents;
  onRestart: () => void;
}

export function FinalSummary({ selectedComponents, onRestart }: FinalSummaryProps) {
  const { toast } = useToast();
  const [profitMargin, setProfitMargin] = useState(25); // Default 25%
  
  const subtotal = Object.values(selectedComponents).reduce(
    (sum, component) => sum + component.price,
    0
  );
  
  const profit = (subtotal * profitMargin) / 100;
  const totalPrice = subtotal + profit;

  const handleSaveQuote = () => {
    toast({
      title: "Cotação salva",
      description: "Sua cotação foi salva com sucesso."
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seu PDF está sendo gerado e será baixado em instantes."
    });
    
    // Simulação de download após 2 segundos
    setTimeout(() => {
      toast({
        title: "PDF Gerado",
        description: "O arquivo PDF foi baixado com sucesso."
      });
    }, 2000);
  };

  const handleFinishOrder = () => {
    toast({
      title: "Pedido finalizado",
      description: "Obrigado por escolher a HostDime! Em breve entraremos em contato."
    });
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Resumo do Seu Servidor</h2>
          <p className="text-muted-foreground">Confira a configuração do seu servidor dedicado</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Configurações
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurações de Margem</DialogTitle>
              <DialogDescription>
                Ajuste a margem de lucro para esta cotação.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span>Margem de lucro:</span>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="w-20 text-right"
                    min={0}
                    max={100}
                  />
                  <span>%</span>
                </div>
              </div>
              <Slider 
                value={[profitMargin]} 
                onValueChange={(values) => setProfitMargin(values[0])}
                max={100}
                step={1}
              />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-lg">{formatCurrency(subtotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lucro ({profitMargin}%)</p>
                  <p className="text-lg text-primary">{formatCurrency(profit)}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-xl font-semibold mb-4">Componentes Selecionados</h3>
        
        <div className="space-y-6">
          {Object.entries(selectedComponents).map(([type, component]) => (
            <div key={type} className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-border last:border-0">
              <div>
                <h4 className="font-medium">{component.name}</h4>
                <p className="text-sm text-muted-foreground">{component.description}</p>
              </div>
              <div>
                {component.specs && (
                  <ul className="text-sm space-y-1">
                    {component.specs.map((spec, index) => (
                      <li key={index} className="text-muted-foreground">• {spec}</li>
                    ))}
                  </ul>
                )}
                <p className="text-primary font-medium mt-2">{formatCurrency(component.price)}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Margem ({profitMargin}%):</span>
                <span>{formatCurrency(profit)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center md:justify-end">
              <span className="text-xl font-medium md:mr-4">Valor Total:</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Valor mensal estimado</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Button className="flex-1 flex items-center justify-center gap-2" onClick={handleFinishOrder}>
          Finalizar Pedido <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="flex-1 flex items-center justify-center gap-2" onClick={handleSaveQuote}>
          <Save className="h-4 w-4" /> Salvar Cotação
        </Button>
        <Button variant="outline" className="flex-1 flex items-center justify-center gap-2" onClick={handleExportPDF}>
          <FileDown className="h-4 w-4" /> Exportar PDF
        </Button>
      </div>
      
      <div className="text-center">
        <Button variant="link" onClick={onRestart}>
          Recomeçar configuração
        </Button>
      </div>
    </div>
  );
}
