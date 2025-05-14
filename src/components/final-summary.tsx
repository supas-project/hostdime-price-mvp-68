import { useState } from "react";
import { ComponentOption } from "@/types/component";
import { Button } from "@/components/ui/button";
import { FileText, Save, ArrowRight, FileDown, Settings, Loader, User, Calendar, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
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
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { QuoteVariables } from "@/utils/pdf/dynamic-variables";

interface FinalSummaryProps {
  selectedComponents: { [key: string]: ComponentOption };
  onRestart: () => void;
}

export function FinalSummary({ selectedComponents, onRestart }: FinalSummaryProps) {
  const { storageItems, customServices, connectivityItems, handleRemoveComponent } = useWizard();
  const [profitMargin, setProfitMargin] = useState(25);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [pdfPreviewOption, setPdfPreviewOption] = useState("preview");
  const [showPdfErrorDialog, setShowPdfErrorDialog] = useState(false);
  const [pdfError, setPdfError] = useState("");
  
  // State for dynamic PDF variables
  const [quoteVariables, setQuoteVariables] = useState<QuoteVariables>({
    responsavelComercial: "Equipe HostDime",
    clientName: "Cliente",
    dataValidade: "30 dias",
    observacoes: "",
    dataEmissao: new Date().toLocaleDateString('pt-BR'),
    numeroContato: "(11) 4766-4840",
    emailContato: "vendas@hostdime.com.br"
  });
  
  const handleSaveQuote = async () => {
    setIsSaving(true);
    try {
      // Simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 800));
      toast("Sua cotação foi salva com sucesso.");
    } catch (error) {
      toast.error("Não foi possível salvar sua cotação. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    setPdfError("");
    
    try {
      // Show toast for PDF generation start
      toast("Aguarde enquanto geramos seu documento...");
      
      // Generate PDF with all required parameters
      await generateQuotePDF(
        selectedComponents,
        storageItems,
        customServices,
        profitMargin,
        connectivityItems,
        pdfPreviewOption === "preview", // Use preview option to determine opening mode
        quoteVariables // Pass dynamic variables
      );
      
    } catch (error) {
      console.error("Erro detalhado:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Store message for display in dialog
      setPdfError(errorMessage);
      setShowPdfErrorDialog(true);
      
      toast.error("Não foi possível gerar o PDF. Clique para mais detalhes.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleFinishOrder = async () => {
    setIsFinishing(true);
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Obrigado por escolher a HostDime! Em breve entraremos em contato.");
    } catch (error) {
      toast.error("Ocorreu um erro ao processar seu pedido. Tente novamente.");
    } finally {
      setIsFinishing(false);
    }
  };
  
  // Handlers for updating dynamic variables
  const handleVariableChange = (key: keyof QuoteVariables, value: string) => {
    setQuoteVariables(prev => ({
      ...prev,
      [key]: value
    }));
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configurações da Cotação</DialogTitle>
              <DialogDescription>
                Ajuste a margem de lucro e as informações que aparecerão no PDF.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="font-medium text-sm">Margem de lucro</div>
                <div className="flex items-center justify-between">
                  <span>Margem:</span>
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
                  className="my-2"
                />
              </div>
              
              <div className="space-y-4 pt-2 border-t">
                <div className="font-medium text-sm">Informações para o PDF</div>
                
                <div className="space-y-2">
                  <Label htmlFor="responsavel">
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span>Responsável Comercial</span>
                    </div>
                  </Label>
                  <Input
                    id="responsavel"
                    value={quoteVariables.responsavelComercial}
                    onChange={(e) => handleVariableChange('responsavelComercial', e.target.value)}
                    placeholder="Nome do responsável"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cliente">
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span>Nome do Cliente</span>
                    </div>
                  </Label>
                  <Input
                    id="cliente"
                    value={quoteVariables.clientName}
                    onChange={(e) => handleVariableChange('clientName', e.target.value)}
                    placeholder="Nome do cliente"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="validade">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Validade da Proposta</span>
                    </div>
                  </Label>
                  <Input
                    id="validade"
                    value={quoteVariables.dataValidade}
                    onChange={(e) => handleVariableChange('dataValidade', e.target.value)}
                    placeholder="Ex: 30 dias"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contato">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      <span>Número de Contato</span>
                    </div>
                  </Label>
                  <Input
                    id="contato"
                    value={quoteVariables.numeroContato}
                    onChange={(e) => handleVariableChange('numeroContato', e.target.value)}
                    placeholder="Ex: (11) 4766-4840"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email de Contato</span>
                    </div>
                  </Label>
                  <Input
                    id="email"
                    value={quoteVariables.emailContato}
                    onChange={(e) => handleVariableChange('emailContato', e.target.value)}
                    placeholder="Ex: vendas@hostdime.com.br"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={quoteVariables.observacoes}
                    onChange={(e) => handleVariableChange('observacoes', e.target.value)}
                    placeholder="Observações adicionais para a proposta"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Opções de exportação PDF:</h4>
                <Tabs defaultValue="preview" value={pdfPreviewOption} onValueChange={setPdfPreviewOption}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Visualizar em Nova Aba</TabsTrigger>
                    <TabsTrigger value="download">Download Direto</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <OrderDetails 
        selectedComponents={selectedComponents}
        margin={profitMargin}
        onRemoveItem={handleRemoveComponent}
      />
      
      {/* Detailed error dialog for PDF */}
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
