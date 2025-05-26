import { useState } from "react";
import { ComponentOption } from "@/types/component";
import { Button } from "@/components/ui/button";
import { FileText, Save, ArrowRight, FileDown, Settings, Loader, User, Calendar, Mail, Phone, Globe, X } from "lucide-react";
import { toast } from "sonner";
import { OrderDetails } from "@/components/order-details"; // Caminho correto para o componente
import { generateQuotePDF, generateQuoteWebView } from "@/utils/quote-export";
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
import { Textarea } from "@/components/ui/textarea"; // Caminho correto
import { Label } from "@/components/ui/label"; // Caminho correto
import { QuoteVariables } from "@/utils/pdf/dynamic-variables";
import { StorageItemsMap, ConnectivityItemsMap } from "@/types/wizard";
import { convertStorageItemsMapToArray, convertConnectivityToArray, convertCustomServicesToArray } from "@/utils/storage-utils";
import { deduplicateStorageItems } from "@/utils/html/price-calculator";
import { PDFTemplateSelector } from "@/components/pdf/PDFTemplateSelector";

interface FinalSummaryProps {
  selectedComponents: { [key: string]: ComponentOption };
  onRestart: () => void;
  storageItems?: { [key: string]: { option: ComponentOption; quantity: number } };
  connectivityItems?: ConnectivityItemsMap;
  customServices?: { [key: string]: { option: ComponentOption; quantity: number } };
}

export function FinalSummary({ selectedComponents, onRestart, storageItems: storageItemsMap, customServices: customServicesMap, connectivityItems }: FinalSummaryProps) {
  const [profitMargin, setProfitMargin] = useState(25);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [pdfPreviewOption, setPdfPreviewOption] = useState("preview");
  const [showPdfErrorDialog, setShowPdfErrorDialog] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [documentFormat, setDocumentFormat] = useState<"pdf" | "web">("web");
  
  // Enhanced state for dynamic PDF variables with HostDime branding defaults
  const [quoteVariables, setQuoteVariables] = useState<QuoteVariables>({
    responsavelComercial: "Equipe Comercial HostDime",
    clientName: "Cliente",
    dataValidade: "30 dias",
    observacoes: "",
    dataEmissao: new Date().toLocaleDateString('pt-BR'),
    numeroContato: "(11) 4766-4840",
    emailContato: "vendas@hostdime.com.br"
  });
  
  const { storageItems: contextStorageItems, customServices: contextCustomServices, connectivityItems: contextConnectivityItems, handleRemoveComponent } = useWizard();
  
  // Use provided items or fall back to context items
  let effectiveStorageItems = storageItemsMap 
    ? convertStorageItemsMapToArray(storageItemsMap)
    : contextStorageItems;
    
  // CORREÇÃO: Garantir que os discos estão deduplicados antes de passar para o componente OrderDetails
  effectiveStorageItems = {
    internal: deduplicateStorageItems(effectiveStorageItems.internal || []),
    external: deduplicateStorageItems(effectiveStorageItems.external || [])
  };
  
  console.log(`[FinalSummary] Deduplicando discos internos: ${(effectiveStorageItems.internal || []).length} itens`);
  console.log(`[FinalSummary] Deduplicando storages externos: ${(effectiveStorageItems.external || []).length} itens`);
    
  const effectiveCustomServices = customServicesMap 
    ? convertCustomServicesToArray(customServicesMap)
    : contextCustomServices;
    
  const effectiveConnectivityItems = connectivityItems || contextConnectivityItems;
  
  const [selectedTemplate, setSelectedTemplate] = useState("hostdime-corporate");
  
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
      // Show toast for document generation start
      toast("Aguarde enquanto geramos seu documento...");
      
      // CORREÇÃO: Garante que os itens estão deduplificados antes de gerar a visualização
      const dedupedStorageItems = {
        internal: deduplicateStorageItems(effectiveStorageItems.internal || []),
        external: deduplicateStorageItems(effectiveStorageItems.external || [])
      };
      
      console.log(`[ExportPDF] Quantidade de discos original: ${effectiveStorageItems.internal?.length}, deduplificados: ${dedupedStorageItems.internal.length}`);
      
      if (documentFormat === "web") {
        // Generate HTML web view in new tab
        generateQuoteWebView(
          selectedComponents,
          dedupedStorageItems, // CORREÇÃO: Usa itens deduplificados
          effectiveCustomServices,
          profitMargin,
          effectiveConnectivityItems,
          quoteVariables
        );
      } else {
        // Generate PDF (old behavior)
        await generateQuotePDF(
          selectedComponents,
          dedupedStorageItems, // CORREÇÃO: Usa itens deduplificados
          effectiveCustomServices,
          profitMargin,
          effectiveConnectivityItems,
          pdfPreviewOption === "preview", // Use preview option to determine opening mode
          quoteVariables
        );
      }
      
    } catch (error) {
      console.error("Erro detalhado:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Store message for display in dialog
      setPdfError(errorMessage);
      setShowPdfErrorDialog(true);
      
      toast.error("Não foi possível gerar o documento. Clique para mais detalhes.");
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

  // Label for the export button based on format
  const getExportButtonLabel = () => {
    if (isGeneratingPDF) {
      return "Gerando documento...";
    }
    
    if (documentFormat === "web") {
      return "Visualizar Cotação";
    } else {
      return pdfPreviewOption === "preview" ? "Visualizar PDF" : "Exportar PDF";
    }
  };
  
  // Icon for the export button
  const getExportButtonIcon = () => {
    if (isGeneratingPDF) {
      return <Loader className="h-4 w-4 animate-spin" />;
    }
    
    return documentFormat === "web" ? 
      <Globe className="h-4 w-4" /> : 
      <FileDown className="h-4 w-4" />;
  };
  
  const handleRemoveItem = (itemId: string) => {
    if (handleRemoveComponent) {
      handleRemoveComponent(itemId);
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configurações da Cotação</DialogTitle>
              <DialogDescription>
                Ajuste a margem de lucro, template do PDF e as informações que aparecerão no documento.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Template Selection */}
              <PDFTemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
              />
              
              <div className="border-t pt-4">
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
              </div>
              
              <div className="space-y-4 pt-2 border-t">
                <div className="font-medium text-sm">Informações para o documento</div>
                
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
                <h4 className="text-sm font-medium mb-2">Formato do documento:</h4>
                <Tabs defaultValue="web" value={documentFormat} onValueChange={(value) => setDocumentFormat(value as "pdf" | "web")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="web">Visualização Web</TabsTrigger>
                    <TabsTrigger value="pdf">PDF</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {documentFormat === "pdf" && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Opções de PDF:</h4>
                    <Tabs defaultValue="preview" value={pdfPreviewOption} onValueChange={setPdfPreviewOption}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="preview">Visualizar em Nova Aba</TabsTrigger>
                        <TabsTrigger value="download">Download Direto</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <OrderDetails 
        selectedComponents={selectedComponents}
        margin={profitMargin}
        onRemoveItem={handleRemoveItem}
      />
      
      {/* Detailed error dialog for PDF */}
      <AlertDialog open={showPdfErrorDialog} onOpenChange={setShowPdfErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erro na geração do documento</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="text-sm text-destructive mt-2 mb-3">
                Ocorreu um erro ao gerar o documento. Isso pode ser causado por:
              </div>
              <ul className="list-disc pl-5 mb-3 space-y-1 text-sm">
                <li>Caracteres especiais incompatíveis</li>
                <li>Problemas de formatação nos dados</li>
                <li>Falha ao renderizar elementos gráficos</li>
                <li>Bloqueio de popups pelo navegador</li>
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
          variant={documentFormat === "web" ? "default" : "outline"}
          className="flex-1 flex items-center justify-center gap-2" 
          onClick={handleExportPDF}
          disabled={isGeneratingPDF || isSaving || isFinishing}
        >
          {isGeneratingPDF ? (
            <>
              <Loader className="h-4 w-4 animate-spin" /> Gerando documento...
            </>
          ) : (
            <>
              {getExportButtonIcon()} {getExportButtonLabel()}
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
