
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PriceItem } from "@/types/pricing";
import { toast } from "@/utils/toast-utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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
  } | null>(null);

  // Validate the JSON structure
  const validateJson = (text: string): { isValid: boolean; message: string; items?: PriceItem[] } => {
    try {
      // Parse the JSON
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        return { isValid: false, message: "JSON inválido: Verifique a sintaxe" };
      }

      // Check if it's an array of items directly
      if (Array.isArray(parsed)) {
        const items = parsed;
        
        // Validate each item has the required fields
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (!item.name || typeof item.price !== 'number') {
            return { 
              isValid: false, 
              message: `Item na posição ${i} está incompleto. Todos os itens precisam ter pelo menos 'name' e 'price'` 
            };
          }
          
          // Ensure type is set to categoryId if not provided
          if (!item.type) {
            item.type = categoryId;
          }
          
          // Ensure specs is an array
          if (item.specs && !Array.isArray(item.specs)) {
            return { 
              isValid: false, 
              message: `Item '${item.name}' tem specs em formato inválido. Deve ser um array.` 
            };
          }
          
          // Ensure tags is an array
          if (item.tags && !Array.isArray(item.tags)) {
            return { 
              isValid: false, 
              message: `Item '${item.name}' tem tags em formato inválido. Deve ser um array.` 
            };
          }
        }
        
        return { isValid: true, message: `${items.length} itens validados com sucesso`, items };
      } 
      // Check if it's a category object with an items array
      else if (parsed && typeof parsed === 'object' && parsed.items && Array.isArray(parsed.items)) {
        const items = parsed.items;
        
        // Validate each item
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (!item.name || typeof item.price !== 'number') {
            return { 
              isValid: false, 
              message: `Item na posição ${i} está incompleto. Todos os itens precisam ter pelo menos 'name' e 'price'` 
            };
          }
          
          // Ensure type is set to categoryId if not provided
          if (!item.type) {
            item.type = categoryId;
          }
          
          // Ensure specs is an array
          if (item.specs && !Array.isArray(item.specs)) {
            return { 
              isValid: false, 
              message: `Item '${item.name}' tem specs em formato inválido. Deve ser um array.` 
            };
          }
          
          // Ensure tags is an array
          if (item.tags && !Array.isArray(item.tags)) {
            return { 
              isValid: false, 
              message: `Item '${item.name}' tem tags em formato inválido. Deve ser um array.` 
            };
          }
        }
        
        return { isValid: true, message: `${items.length} itens validados com sucesso`, items };
      } else {
        return { 
          isValid: false, 
          message: "Formato inválido. Forneça um array de itens ou um objeto com propriedade 'items'" 
        };
      }
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
    
    const result = validateJson(jsonText);
    setValidationResult({ isValid: result.isValid, message: result.message });
  };

  const handleSubmit = async () => {
    if (!jsonText.trim()) {
      setValidationResult({ isValid: false, message: "Por favor, insira o JSON para importar" });
      return;
    }
    
    const validation = validateJson(jsonText);
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
          {validationResult.message}
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
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
