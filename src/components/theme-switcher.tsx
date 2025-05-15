
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeSwitcher() {
  const { theme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full h-9 w-9 transition-all duration-200 focus-visible:ring-offset-2",
              "hover:text-primary hover:bg-primary/10"
            )}
            disabled
            aria-label="Tema escuro ativo"
          >
            <Moon className="h-5 w-5" />
            <span className="sr-only">Tema escuro ativo</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Tema escuro ativo</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
