
import { Loader2 } from "lucide-react";

export function DiskLoadingState() {
  return (
    <div className="py-8 flex flex-col items-center justify-center text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-muted-foreground">Carregando opções de disco...</p>
    </div>
  );
}
