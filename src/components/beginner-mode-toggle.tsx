
import { useWizard } from "@/contexts/WizardContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function BeginnerModeToggle() {
  const { beginnerMode, setBeginnerMode } = useWizard();
  
  const handleToggleMode = (value: boolean) => {
    setBeginnerMode(value);
    // Toast notifications removed
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
