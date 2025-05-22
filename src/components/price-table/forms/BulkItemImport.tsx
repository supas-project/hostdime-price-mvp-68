
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PriceItem } from "@/types/pricing";
import { toast } from "@/utils/toast-utils";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface BulkItemImportProps {
  categoryId: string;
  onImport: (items: PriceItem[]) => Promise<{success: boolean, message: string, importedCount: number}>;
  onClose: () => void;
}

export function BulkItemImport({ categoryId, onImport, onClose }: BulkItemImportProps) {
  const [jsonText, setJsonText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    correctedJson?: string;
  } | null>(null);

  // Auto-correct and validate the JSON structure
  const validateAndCorrectJson = (text: string): { 
    isValid: boolean; 
    message: string; 
    items?: PriceItem[];
    correctedJson?: string;
  } => {
    try {
      // Initial cleanup of the string
      let cleanedText = text.trim();
      
      // Try to detect and fix common JSON syntax errors
      const corrections = [];
      
      // Handle case where text is not wrapped in [] for arrays or {} for objects
      if (!cleanedText.startsWith('[') && !cleanedText.startsWith('{')) {
        if (cleanedText.includes('{')) {
          cleanedText = '[' + cleanedText + ']';
          corrections.push("Added missing array brackets []");
        } else {
          // Can't automatically fix if structure is too different
          return { 
            isValid: false, 
            message: "O formato JSON não é reconhecido. Deve começar com '[' ou '{'." 
          };
        }
      }
      
      // Handle missing quotes around property names
      cleanedText = cleanedText.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
      
      // Handle single quotes instead of double quotes (convert to double)
      cleanedText = cleanedText.replace(/'/g, '"');
      
      // Parse the JSON
      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (e) {
        return { 
          isValid: false, 
          message: `JSON inválido após correções: ${e instanceof Error ? e.message : 'Erro de sintaxe'}`
        };
      }

      // Normalize the structure - handle nested arrays (important fix)
      let items: any[] = [];
      
      if (Array.isArray(parsed)) {
        // Check for nested arrays - common issue when pasting from other sources
        if (parsed.length > 0 && Array.isArray(parsed[0])) {
          items = parsed.flat();
          corrections.push("Corrigido array aninhado (array dentro de array)");
        } else {
          items = parsed;
        }
      } 
      // Handle if it's a category object with an items array
      else if (parsed && typeof parsed === 'object' && parsed.items && Array.isArray(parsed.items)) {
        items = parsed.items;
      } 
      // Handle if it's a single item object
      else if (parsed && typeof parsed === 'object' && parsed.name) {
        items = [parsed];
        corrections.push("Convertido objeto único em array");
      } else {
        return { 
          isValid: false, 
          message: "Formato inválido. Forneça um array de itens ou um objeto com propriedade 'items'" 
        };
      }

      // Validate and auto-correct each item
      const validatedItems = [];
      const itemCorrections = [];
      
      for (let i = 0; i < items.length; i++) {
        const item = { ...items[i] };
        
        // Required fields validation and correction
        if (!item.name) {
          item.name = `Item ${i + 1}`;
          itemCorrections.push(`Item ${i + 1}: Adicionado nome padrão`);
        }
        
        if (typeof item.price !== 'number') {
          if (item.price === undefined) {
            item.price = 0;
            itemCorrections.push(`Item "${item.name}": Adicionado preço 0`);
          } else {
            // Try to convert to number if it's a string
            const parsedPrice = parseFloat(String(item.price).replace(/[^\d.,]/g, '').replace(',', '.'));
            if (!isNaN(parsedPrice)) {
              item.price = parsedPrice;
              itemCorrections.push(`Item "${item.name}": Convertido preço para número (${parsedPrice})`);
            } else {
              item.price = 0;
              itemCorrections.push(`Item "${item.name}": Preço inválido substituído por 0`);
            }
          }
        }
        
        // Description field
        if (!item.description) {
          item.description = `Descrição para ${item.name}`;
          itemCorrections.push(`Item "${item.name}": Adicionado descrição padrão`);
        }
        
        // Ensure type is set to categoryId if not provided
        if (!item.type) {
          item.type = categoryId;
          itemCorrections.push(`Item "${item.name}": Adicionado tipo "${categoryId}"`);
        }
        
        // Ensure specs is an array
        if (!item.specs) {
          item.specs = [];
          itemCorrections.push(`Item "${item.name}": Inicializado specs como array vazio`);
        } else if (!Array.isArray(item.specs)) {
          if (typeof item.specs === 'string') {
            // Try to convert comma-separated string to array
            item.specs = item.specs.split(',').map(s => s.trim());
            itemCorrections.push(`Item "${item.name}": Convertido specs de texto para array`);
          } else {
            item.specs = [];
            itemCorrections.push(`Item "${item.name}": Substituído specs inválido por array vazio`);
          }
        }
        
        // Ensure tags is an array
        if (!item.tags) {
          item.tags = [];
          itemCorrections.push(`Item "${item.name}": Inicializado tags como array vazio`);
        } else if (!Array.isArray(item.tags)) {
          if (typeof item.tags === 'string') {
            // Try to convert comma-separated string to array
            item.tags = item.tags.split(',').map(s => s.trim());
            itemCorrections.push(`Item "${item.name}": Convertido tags de texto para array`);
          } else {
            item.tags = [];
            itemCorrections.push(`Item "${item.name}": Substituído tags inválido por array vazio`);
          }
        }
        
        // Ensure metadata is an object
        if (!item.metadata) {
          item.metadata = {};
        } else if (typeof item.metadata !== 'object') {
          item.metadata = {};
          itemCorrections.push(`Item "${item.name}": Substituído metadata inválido por objeto vazio`);
        }
        
        validatedItems.push(item);
      }
      
      // Create corrected JSON string
      const correctedJson = JSON.stringify(validatedItems, null, 2);
      
      // Create message with corrections
      let messagePrefix = validatedItems.length > 0 
        ? `${validatedItems.length} itens validados com sucesso` 
        : "Nenhum item válido encontrado";
        
      let correctionMessage = "";
      if (corrections.length > 0 || itemCorrections.length > 0) {
        correctionMessage = "\n\nCorreções automáticas:";
        if (corrections.length > 0) {
          correctionMessage += "\n- " + corrections.join("\n- ");
        }
        if (itemCorrections.length > 0) {
          correctionMessage += "\n- " + itemCorrections.join("\n- ");
        }
      }
      
      return { 
        isValid: true, 
        message: messagePrefix + correctionMessage, 
        items: validatedItems as PriceItem[],
        correctedJson
      };
    } catch (error) {
      return { 
        isValid: false, 
        message: `Erro na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonText(value);
    
    // Clear validation result when input changes
    if (validationResult) {
      setValidationResult(null);
    }
  };

  const handleValidate = () => {
    if (!jsonText.trim()) {
      setValidationResult({ isValid: false, message: "Por favor, insira o JSON para validar" });
      return;
    }
    
    const result = validateAndCorrectJson(jsonText);
    setValidationResult({ 
      isValid: result.isValid, 
      message: result.message,
      correctedJson: result.correctedJson
    });
    
    // If there's a corrected version, update the textarea with it
    if (result.isValid && result.correctedJson && result.correctedJson !== jsonText) {
      setJsonText(result.correctedJson);
    }
  };

  const handleSubmit = async () => {
    if (!jsonText.trim()) {
      setValidationResult({ isValid: false, message: "Por favor, insira o JSON para importar" });
      return;
    }
    
    const validation = validateAndCorrectJson(jsonText);
    if (!validation.isValid || !validation.items) {
      setValidationResult({ isValid: false, message: validation.message });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the import function with the validated items
      const result = await onImport(validation.items);
      
      if (result.success) {
        toast.success("Importação concluída", {
          description: `${result.importedCount} itens foram importados com sucesso.`,
          icon: <CheckCircle2 className="h-5 w-5" />
        });
        onClose(); // Close the dialog on success
      } else {
        toast.error("Erro na importação", {
          description: result.message,
          icon: <AlertCircle className="h-5 w-5" />
        });
      }
    } catch (error) {
      toast.error("Falha na importação", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        icon: <AlertCircle className="h-5 w-5" />
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoCorrect = () => {
    if (!jsonText.trim()) {
      setValidationResult({ isValid: false, message: "Por favor, insira o JSON para corrigir" });
      return;
    }
    
    const result = validateAndCorrectJson(jsonText);
    setValidationResult({ 
      isValid: result.isValid, 
      message: result.message,
      correctedJson: result.correctedJson
    });
    
    // Update the textarea with the corrected version
    if (result.isValid && result.correctedJson) {
      setJsonText(result.correctedJson);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          JSON de Itens (para a categoria: {categoryId})
        </label>
        <Textarea 
          value={jsonText}
          onChange={handleInputChange}
          placeholder='[{"name": "Item 1", "description": "Descrição", "price": 100, "type": "categoria"}]'
          className="min-h-[200px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Cole um array JSON de itens ou um objeto com propriedade 'items'
        </p>
      </div>
      
      {validationResult && (
        <div className={`p-3 rounded-md text-sm ${
          validationResult.isValid ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="whitespace-pre-line">{validationResult.message}</div>
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          type="button" 
          onClick={handleAutoCorrect} 
          disabled={isSubmitting || !jsonText.trim()}
          className="flex items-center"
        >
          <Info className="mr-2 h-4 w-4" />
          Corrigir JSON
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          onClick={handleValidate} 
          disabled={isSubmitting || !jsonText.trim()}
        >
          Validar JSON
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit} 
          disabled={isSubmitting || !validationResult?.isValid}
        >
          Importar Itens
        </Button>
      </div>
    </div>
  );
}
