
import { useWizard } from "@/contexts/WizardContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function BeginnerModeToggle() {
  const { beginnerMode, setBeginnerMode } = useWizard();
  
  const handleToggleMode = (value: boolean) => {
    setBeginnerMode(value);
    
    // Show a toast notification instead of reloading
    toast.success(
      value ? "Modo Iniciante ativado" : "Modo Avançado ativado", 
      {
        description: value 
          ? "Você receberá dicas e orientações durante o processo" 
          : "Interface simplificada para usuários experientes",
        duration: 3000
      }
    );
  };

  // Component is now hidden by default but still functional if needed elsewhere
  return (
    <div className="hidden items-center space-x-2">
      <Switch 
        id="beginner-mode" 
        checked={beginnerMode} 
        onCheckedChange={handleToggleMode}
      />
      <Label htmlFor="beginner-mode" className="cursor-pointer">
        {beginnerMode ? "Modo Iniciante" : "Modo Avançado"}
      </Label>
    </div>
  );
}
