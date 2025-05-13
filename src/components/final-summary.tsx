
import { useState } from "react";
import { ComponentOption } from "@/types/component";
import { Button } from "@/components/ui/button";
import { FileText, Save, ArrowRight, FileDown, Settings, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrderDetails } from "./order-details";
import { generateQuotePDF } from "@/utils/quote-export";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomService } from "@/types/wizard";

interface FinalSummaryProps {
  selectedComponents: { [key: string]: ComponentOption };
  onRestart: () => void;
}

export function FinalSummary({ selectedComponents, onRestart }: FinalSummaryProps) {
  const { toast } = useToast();
  const { storageItems, customServices, connectivityItems, handleRemoveComponent } = useWizard();
  const [profitMargin, setProfitMargin] = useState(25);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [pdfPreviewOption, setPdfPreviewOption] = useState("preview");
  
  const handleSaveQuote = async () => {
    setIsSaving(true);
    try {
      // Simular uma operação de salvamento
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success({
        title: "Cotação salva",
        description: "Sua cotação foi salva com sucesso."
      });
    } catch (error) {
      toast.error({
        title: "Erro ao salvar cotação",
        description: "Não foi possível salvar sua cotação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Exibir toast de início da geração do PDF
      toast.info({
        title: "Preparando PDF",
        description: "Aguarde enquanto geramos seu documento..."
      });
      
      // Convert customServices to ComponentOption[] for PDF generation compatibility
      const customServicesAsComponents: ComponentOption[] = customServices.map(service => ({
        ...service
      }));
      
      // Ensure we're passing all arguments with correct types
      await generateQuotePDF(
        selectedComponents,
        storageItems,
        customServicesAsComponents,
        profitMargin,
        connectivityItems,
        pdfPreviewOption === "preview" // Passar true para abrir em nova aba, false para download direto
      );
      
    } catch (error) {
      toast.error({
        title: "Erro na exportação",
        description: "Não foi possível gerar o PDF. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
      console.error("Erro detalhado:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleFinishOrder = async () => {
    setIsFinishing(true);
    try {
      // Simular o processamento do pedido
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success({
        title: "Pedido finalizado",
        description: "Obrigado por escolher a HostDime! Em breve entraremos em contato."
      });
    } catch (error) {
      toast.error({
        title: "Erro ao finalizar pedido",
        description: "Ocorreu um erro ao processar seu pedido. Tente novamente.",
        variant: "destructive" 
      });
    } finally {
      setIsFinishing(false);
    }
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
              
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Opções de exportação PDF:</h4>
                <Tabs defaultValue="preview" value={pdfPreviewOption} onValueChange={setPdfPreviewOption}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Visualizar em Nova Aba</TabsTrigger>
                    <TabsTrigger value="download">Download Direto</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                Nota: A margem é usada para cálculos internos e não será mostrada no PDF.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <OrderDetails 
        selectedComponents={selectedComponents}
        margin={profitMargin}
        onRemoveItem={handleRemoveComponent}
      />
      
      <div className="flex flex-col md:flex-row gap-4">
        <Button 
          className="flex-1 flex items-center justify-center gap-2" 
          onClick={handleFinishOrder}
          disabled={isFinishing || isGeneratingPDF || isSaving}
        >
          {isFinishing ? (
            <>
              <Loader className="h-4 w-4 animate-spin" /> Processando...
            </>
          ) : (
            <>
              Finalizar Pedido <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-2" 
          onClick={handleSaveQuote}
          disabled={isSaving || isGeneratingPDF || isFinishing}
        >
          {isSaving ? (
            <>
              <Loader className="h-4 w-4 animate-spin" /> Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Salvar Cotação
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 flex items-center justify-center gap-2" 
          onClick={handleExportPDF}
          disabled={isGeneratingPDF || isSaving || isFinishing}
        >
          {isGeneratingPDF ? (
            <>
              <Loader className="h-4 w-4 animate-spin" /> Gerando PDF...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" /> {pdfPreviewOption === "preview" ? "Visualizar PDF" : "Exportar PDF"}
            </>
          )}
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
