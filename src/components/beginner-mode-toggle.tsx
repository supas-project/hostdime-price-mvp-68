
import { useWizard } from "@/contexts/WizardContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/component-selection/use-local-storage";

export function BeginnerModeToggle() {
  const { beginnerMode } = useWizard();
  
  // Access the context setter function directly
  const updateBeginnerMode = (value: boolean) => {
    // We'll use localStorage directly since the context already uses useLocalStorage
    localStorage.setItem('beginnerMode', JSON.stringify(value));
    // Force reload to apply the change throughout the app
    window.location.reload();
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="beginner-mode" 
        checked={beginnerMode} 
        onCheckedChange={updateBeginnerMode}
      />
      <Label htmlFor="beginner-mode" className="cursor-pointer">
        {beginnerMode ? "Modo Iniciante" : "Modo Avançado"}
      </Label>
    </div>
  );
}
