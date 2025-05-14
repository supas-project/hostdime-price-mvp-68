
import { Button } from "@/components/ui/button";
import { FileUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "@/components/help-tooltip";

interface ImportButtonProps {
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImportButton({ isLoading, fileInputRef, onFileUpload }: ImportButtonProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Button 
        variant="outline" 
        className={cn(
          "relative transition-all border-primary/20 hover:border-primary",
          isLoading && "bg-primary/5 pointer-events-none"
        )} 
        disabled={isLoading}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer"
          accept=".xlsx,.xls,.json,.csv"
          onChange={onFileUpload}
          disabled={isLoading}
        />
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
        ) : (
          <FileUp className="mr-2 h-4 w-4 text-primary" />
        )}
        {isLoading ? 'Importando...' : 'Importar Arquivo'}
      </Button>
      <HelpTooltip
        title="Importar Tabela de Preços"
        description="Importe dados de uma planilha Excel (.xlsx, .xls), arquivo CSV ou JSON para popular a tabela de preços."
        iconOnly
      />
    </div>
  );
}
