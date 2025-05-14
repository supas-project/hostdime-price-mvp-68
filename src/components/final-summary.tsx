
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [showPdfErrorDialog, setShowPdfErrorDialog] = useState(false);
  const [pdfError, setPdfError] = useState("");
  
  const handleSaveQuote = async () => {
    setIsSaving(true);
    try {
      // Simular uma operação de salvamento
      await new Promise(resolve => setTimeout(resolve, 800));
      toast("Cotação salva", {
        description: "Sua cotação foi salva com sucesso."
      });
    } catch (error) {
      toast.error("Erro ao salvar cotação", {
        description: "Não foi possível salvar sua cotação. Tente novamente."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    setPdfError("");
    
    try {
      // Exibir toast de início da geração do PDF
      toast("Preparando PDF", {
        description: "Aguarde enquanto geramos seu documento..."
      });
      
      // Ensure we're passing all arguments with correct types
      await generateQuotePDF(
        selectedComponents,
        storageItems,
        customServices,
        profitMargin,
        connectivityItems,
        pdfPreviewOption === "preview" // Passar true para abrir em nova aba, false para download direto
      );
      
    } catch (error) {
      console.error("Erro detalhado:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Armazenar mensagem para exibição no diálogo
      setPdfError(errorMessage);
      setShowPdfErrorDialog(true);
      
      toast.error("Erro na exportação", {
        description: "Não foi possível gerar o PDF. Clique para mais detalhes."
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleFinishOrder = async () => {
    setIsFinishing(true);
    try {
      // Simular o processamento do pedido
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Pedido finalizado", {
        description: "Obrigado por escolher a HostDime! Em breve entraremos em contato."
      });
    } catch (error) {
      toast.error("Erro ao finalizar pedido", {
        description: "Ocorreu um erro ao processar seu pedido. Tente novamente."
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
      
      {/* Diálogo de erro detalhado para PDF */}
      <AlertDialog open={showPdfErrorDialog} onOpenChange={setShowPdfErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erro na geração do PDF</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="text-sm text-destructive mt-2 mb-3">
                Ocorreu um erro ao gerar o PDF. Isso pode ser causado por:
              </div>
              <ul className="list-disc pl-5 mb-3 space-y-1 text-sm">
                <li>Caracteres especiais incompatíveis</li>
                <li>Problemas de formatação nos dados</li>
                <li>Falha ao renderizar elementos gráficos</li>
              </ul>
              
              <div className="bg-muted p-2 rounded text-xs font-mono my-2 max-h-24 overflow-auto">
                {pdfError || "Erro desconhecido"}
              </div>
              
              <p className="text-sm mt-3">
                Recomendação: tente simplificar os dados ou remover caracteres especiais e símbolos.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Entendi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
