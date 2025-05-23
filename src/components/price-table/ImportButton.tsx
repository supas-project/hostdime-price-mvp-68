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
  return;
}