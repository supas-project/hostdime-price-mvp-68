
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";

interface ImportButtonProps {
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImportButton({ isLoading, fileInputRef, onFileUpload }: ImportButtonProps) {
  return (
    <Button variant="outline" className="relative" disabled={isLoading}>
      <input 
        ref={fileInputRef}
        type="file" 
        className="absolute inset-0 opacity-0 cursor-pointer"
        accept=".xlsx,.xls,.json,.csv"
        onChange={onFileUpload}
      />
      <FileUp className="mr-2 h-4 w-4" />
      {isLoading ? 'Importando...' : 'Importar Arquivo'}
    </Button>
  );
}
