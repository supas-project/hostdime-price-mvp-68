
import { ComponentOption } from "@/data/server-components";
import { Button } from "@/components/ui/button";
import { FileText, Save } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SelectedComponents {
  [key: string]: ComponentOption;
}

interface FinalSummaryProps {
  selectedComponents: SelectedComponents;
  onRestart: () => void;
}

export function FinalSummary({ selectedComponents, onRestart }: FinalSummaryProps) {
  const { toast } = useToast();
  
  const totalPrice = Object.values(selectedComponents).reduce(
    (sum, component) => sum + component.price,
    0
  );

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
  };

  const handleFinishOrder = () => {
    toast({
      title: "Pedido finalizado",
      description: "Obrigado por escolher a HostDime! Em breve entraremos em contato."
    });
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">Resumo do Seu Servidor</h2>
        <p className="text-muted-foreground">Confira a configuração do seu servidor dedicado</p>
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
          <div className="flex justify-between items-center">
            <span className="text-xl font-medium">Valor Total</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Valor mensal estimado</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Button className="flex-1" onClick={handleFinishOrder}>
          Finalizar Pedido
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleSaveQuote}>
          <Save className="mr-2 h-4 w-4" /> Salvar Cotação
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleExportPDF}>
          <FileText className="mr-2 h-4 w-4" /> Exportar PDF
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
