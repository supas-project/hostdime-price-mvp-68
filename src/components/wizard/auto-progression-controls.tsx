
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Zap, Clock, X } from "lucide-react";
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
    onConfigChange({ ...config, enabled });
  };

  const handleToggleFastMode = (fastMode: boolean) => {
    onConfigChange({ ...config, fastMode });
  };

  return (
    <div className="space-y-3">
      {/* Indicador de Progressão */}
      {shouldProgress && countdownSeconds && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
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
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isSimpleCategory && (
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Auto-avanço
          </Badge>
        )}
        {isOptionalCategory && (
          <Badge variant="outline" className="text-xs">
            Opcional
          </Badge>
        )}
        {isComplexCategoryReady && (
          <Badge variant="default" className="text-xs bg-green-600">
            Pronto para avançar
          </Badge>
        )}
      </div>

      {/* Controles de Configuração */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="auto-progression"
            checked={config.enabled}
            onCheckedChange={handleToggleEnabled}
          />
          <Label htmlFor="auto-progression" className="text-sm">
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

      {/* Configurações Avançadas */}
      {showSettings && (
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Configurações Avançadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
            
            <div className="text-xs text-muted-foreground">
              <p>• Modo Normal: {config.delay}ms de delay</p>
              <p>• Modo Rápido: 500ms de delay</p>
              <p>• Categorias opcionais: 3s sem interação</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
