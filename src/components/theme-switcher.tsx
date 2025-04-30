
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "transition-all duration-200 rounded-full",
        "hover:text-primary"
      )}
      title="Tema escuro ativo"
      disabled
    >
      <Moon className="h-5 w-5" />
      <span className="sr-only">
        Tema escuro ativo
      </span>
    </Button>
  );
}
