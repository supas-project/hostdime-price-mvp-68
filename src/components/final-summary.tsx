
import { useState } from "react";
import { ComponentOption } from "@/data/server-components";
import { Button } from "@/components/ui/button";
import { FileText, Save, ArrowRight, FileDown, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrderDetails } from "./order-details";
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

interface FinalSummaryProps {
  selectedComponents: { [key: string]: ComponentOption };
  onRestart: () => void;
}

export function FinalSummary({ selectedComponents, onRestart }: FinalSummaryProps) {
  const { toast } = useToast();
  const [profitMargin, setProfitMargin] = useState(25);
  
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
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <OrderDetails 
        selectedComponents={selectedComponents}
        margin={profitMargin}
      />
      
      <div className="flex flex-col md:flex-row gap-4">
        <Button 
          className="flex-1 flex items-center justify-center gap-2" 
          onClick={handleFinishOrder}
        >
          Finalizar Pedido <ArrowRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-2" 
          onClick={handleSaveQuote}
        >
          <Save className="h-4 w-4" /> Salvar Cotação
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-2" 
          onClick={handleExportPDF}
        >
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
