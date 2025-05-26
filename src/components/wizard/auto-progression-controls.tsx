
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Zap, Clock, X, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AutoProgressionControlsProps {
  config: {
    enabled: boolean;
    fastMode: boolean;
    delay: number;
  };
  onConfigChange: (config: any) => void;
  countdownSeconds: number | null;
  shouldProgress: boolean;
  onCancelProgression: () => void;
  isSimpleCategory: boolean;
  isOptionalCategory: boolean;
  isComplexCategoryReady: boolean;
}

export function AutoProgressionControls({
  config,
  onConfigChange,
  countdownSeconds,
  shouldProgress,
  onCancelProgression,
  isSimpleCategory,
  isOptionalCategory,
  isComplexCategoryReady
}: AutoProgressionControlsProps) {
  const [showSettings, setShowSettings] = React.useState(false);

  const handleToggleEnabled = (enabled: boolean) => {
    console.log(`[AutoProgressionControls] Toggling auto-progression: ${enabled}`);
    onConfigChange({ ...config, enabled });
  };

  const handleToggleFastMode = (fastMode: boolean) => {
    console.log(`[AutoProgressionControls] Toggling fast mode: ${fastMode}`);
    onConfigChange({ ...config, fastMode });
  };

  return (
    <div className="space-y-3">
      {/* Indicador de Progressão Ativa */}
      {shouldProgress && countdownSeconds !== null && (
        <Card className="border-orange-200 bg-orange-50 animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600 animate-spin" />
                <span className="text-sm font-medium text-orange-800">
                  Avançando automaticamente em {countdownSeconds}s
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelProgression}
                className="text-orange-600 border-orange-300 hover:bg-orange-100"
              >
                <X className="h-3 w-3 mr-1" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status da Categoria */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        {isSimpleCategory && (
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Auto-avanço ativo
          </Badge>
        )}
        {isOptionalCategory && (
          <Badge variant="outline" className="text-xs">
            Categoria opcional
          </Badge>
        )}
        {isComplexCategoryReady && (
          <Badge variant="default" className="text-xs bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pronto para avançar
          </Badge>
        )}
        {!isSimpleCategory && !isOptionalCategory && !isComplexCategoryReady && (
          <Badge variant="outline" className="text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Avanço manual
          </Badge>
        )}
      </div>

      {/* Controles de Configuração */}
      <Card className="border-muted">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-progression"
                checked={config.enabled}
                onCheckedChange={handleToggleEnabled}
              />
              <Label htmlFor="auto-progression" className="text-sm font-medium">
                Progressão automática
              </Label>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Status atual */}
          <div className="text-xs text-muted-foreground">
            {config.enabled ? "✅ Ativo" : "❌ Desativado"} • 
            {config.fastMode ? " Modo Rápido (800ms)" : ` Modo Normal (${config.delay}ms)`}
          </div>

          {/* Configurações Avançadas */}
          {showSettings && (
            <div className="mt-4 pt-3 border-t space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="fast-mode" className="text-sm">
                  Modo Rápido
                </Label>
                <Switch
                  id="fast-mode"
                  checked={config.fastMode}
                  onCheckedChange={handleToggleFastMode}
                  disabled={!config.enabled}
                />
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• <strong>Categorias simples:</strong> Avançam automaticamente após seleção</p>
                <p>• <strong>Categorias complexas:</strong> Marcadas como prontas, avanço manual</p>
                <p>• <strong>Categorias opcionais:</strong> 5s para interação, depois avançam</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
