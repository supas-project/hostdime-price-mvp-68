
import { Button } from "@/components/ui/button";
import { FileUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "@/components/help-tooltip";
import { useEffect, useState } from "react";

interface ImportButtonProps {
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImportButton({
  isLoading,
  fileInputRef,
  onFileUpload
}: ImportButtonProps) {
  // Estado local para rastrear se o botão foi clicado mas ainda não terminou de carregar
  const [wasClicked, setWasClicked] = useState(false);

  // Resetar o estado wasClicked quando isLoading mudar para false
  useEffect(() => {
    if (!isLoading && wasClicked) {
      setWasClicked(false);
    }
  }, [isLoading]);

  // Manipulador para detectar quando o input é clicado
  const handleInputClick = () => {
    if (!isLoading) {
      setWasClicked(true);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-2", isLoading && "pointer-events-none opacity-70")}
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        title="Importar tabela de preços"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Importando...
          </>
        ) : (
          <>
            <FileUp className="h-4 w-4" />
            Importar
            <HelpTooltip
              title="Importar tabela"
              description="Carregue um arquivo JSON ou CSV com dados de tabela de preços"
            />
          </>
        )}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        onClick={handleInputClick}
        style={{ display: "none" }}
        accept=".json,.csv"
      />
    </div>
  );
}
