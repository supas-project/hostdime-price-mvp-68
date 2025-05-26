
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServerTemplates, ServerTemplate } from "./templates/server-templates";
import { ComponentOption } from "@/types/component";
import { Separator } from "@/components/ui/separator";
import { Zap, Settings } from "lucide-react";

interface QuickStartProps {
  onSelectTemplate: (template: ServerTemplate) => void;
  onCustomConfiguration: () => void;
  className?: string;
}

export function QuickStart({ onSelectTemplate, onCustomConfiguration, className }: QuickStartProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Templates Section */}
      <ServerTemplates onSelectTemplate={onSelectTemplate} />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">ou</span>
        </div>
      </div>

      {/* Custom Configuration Option */}
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <Settings className="h-6 w-6 text-muted-foreground" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Configuração Personalizada</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure seu servidor do zero com total controle sobre cada componente
              </p>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full max-w-xs"
              onClick={onCustomConfiguration}
            >
              <Settings className="h-4 w-4 mr-2" />
              Iniciar Configuração
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          💡 Dica: Templates podem ser personalizados após a seleção
        </p>
      </div>
    </div>
  );
}
