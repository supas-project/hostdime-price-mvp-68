
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ClipboardCheck, Pause, Settings, Zap, CheckCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CartNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  autoProgressionActive?: boolean;
  onPauseAutoProgression?: () => void;
  // Novos props para controles de auto-progressão
  autoProgressionConfig?: {
    enabled: boolean;
    fastMode: boolean;
    delay: number;
  };
  onAutoProgressionConfigChange?: (config: any) => void;
  countdownSeconds?: number | null;
  shouldProgress?: boolean;
  onCancelProgression?: () => void;
  isSimpleCategory?: boolean;
  isOptionalCategory?: boolean;
  isComplexCategoryReady?: boolean;
}

export function CartNavigation({
  isFirstStep,
  isLastStep,
  onPrevious,
  onNext,
  onComplete,
  autoProgressionActive = false,
  onPauseAutoProgression,
  autoProgressionConfig,
  onAutoProgressionConfigChange,
  countdownSeconds,
  shouldProgress,
  onCancelProgression,
  isSimpleCategory,
  isOptionalCategory,
  isComplexCategoryReady
}: CartNavigationProps) {
  const [isNextAnimating, setIsNextAnimating] = useState(false);
  const [showAutoSettings, setShowAutoSettings] = useState(false);

  const handleNextClick = () => {
    setIsNextAnimating(true);
    setTimeout(() => {
      onNext();
      setIsNextAnimating(false);
    }, 300);
  };

  const handleToggleEnabled = (enabled: boolean) => {
    if (autoProgressionConfig && onAutoProgressionConfigChange) {
      console.log(`[CartNavigation] Toggling auto-progression: ${enabled}`);
      onAutoProgressionConfigChange({ ...autoProgressionConfig, enabled });
    }
  };

  const handleToggleFastMode = (fastMode: boolean) => {
    if (autoProgressionConfig && onAutoProgressionConfigChange) {
      console.log(`[CartNavigation] Toggling fast mode: ${fastMode}`);
      onAutoProgressionConfigChange({ ...autoProgressionConfig, fastMode });
    }
  };
  
  return (
    <div className="p-4 border-b border-border bg-card">
      {/* Controles de Auto-progressão - Removida a notificação de countdown */}
      {autoProgressionConfig && onAutoProgressionConfigChange && (
        <div className="mb-3 space-y-2">
          {/* Controles Principais */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-progression-nav"
                checked={autoProgressionConfig.enabled}
                onCheckedChange={handleToggleEnabled}
                className="scale-75"
              />
              <Label htmlFor="auto-progression-nav" className="text-xs font-medium">
                Auto-avanço
              </Label>
              
              {/* Status badges */}
              {isSimpleCategory && autoProgressionConfig.enabled && (
                <Badge variant="secondary" className="text-xs h-5">
                  <Zap className="h-2 w-2 mr-1" />
                  Ativo
                </Badge>
              )}
              {isComplexCategoryReady && (
                <Badge variant="default" className="text-xs h-5 bg-green-600">
                  <CheckCircle className="h-2 w-2 mr-1" />
                  Pronto
                </Badge>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAutoSettings(!showAutoSettings)}
              className="h-6 w-6 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>

          {/* Configurações Expandidas */}
          {showAutoSettings && (
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="fast-mode-nav" className="text-xs">
                  Modo Rápido
                </Label>
                <Switch
                  id="fast-mode-nav"
                  checked={autoProgressionConfig.fastMode}
                  onCheckedChange={handleToggleFastMode}
                  disabled={!autoProgressionConfig.enabled}
                  className="scale-75"
                />
              </div>
              
              <div className="text-xs text-muted-foreground">
                {autoProgressionConfig.enabled ? "✅ Ativo" : "❌ Desativado"} • 
                {autoProgressionConfig.fastMode ? " Rápido (800ms)" : ` Normal (${autoProgressionConfig.delay}ms)`}
              </div>
            </div>
          )}
        </div>
      )}

      {isLastStep ? (
        <div className="space-y-2">
          {/* Indicador de Auto-progressão Original (mantido para compatibilidade) */}
          {autoProgressionActive && !autoProgressionConfig && (
            <div className="flex items-center justify-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
              <span>Progressão automática ativa</span>
              {onPauseAutoProgression && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPauseAutoProgression}
                  className="h-6 px-2 text-orange-600"
                >
                  <Pause className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          
          {/* Botões de Navegação para o último passo */}
          <div className="grid grid-cols-2 w-full gap-2">
            <Button variant="outline" onClick={onPrevious} disabled={isFirstStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button className="w-full" onClick={onComplete}>
              <ClipboardCheck className="mr-2 h-4 w-4" /> Finalizar Pedido
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Indicador de Auto-progressão Original (mantido para compatibilidade) */}
          {autoProgressionActive && !autoProgressionConfig && (
            <div className="flex items-center justify-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
              <span>Progressão automática ativa</span>
              {onPauseAutoProgression && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPauseAutoProgression}
                  className="h-6 px-2 text-orange-600"
                >
                  <Pause className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          
          {/* Botões de Navegação */}
          <div className="grid grid-cols-2 w-full gap-2">
            <Button variant="outline" onClick={onPrevious} disabled={isFirstStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button 
              onClick={handleNextClick} 
              className={isNextAnimating ? "animate-scale-in" : ""}
            >
              Próximo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
