
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export function NotificationDemo() {
  const showSuccessToast = () => {
    toast.success("Operação realizada com sucesso", {
      description: "Os dados foram salvos corretamente no servidor.",
      icon: <CheckCircle className="h-4 w-4" />
    });
  };

  const showErrorToast = () => {
    toast.error("Erro ao processar a requisição", {
      description: "Verifique sua conexão com a internet e tente novamente.",
      icon: <AlertCircle className="h-4 w-4" />
    });
  };

  const showInfoToast = () => {
    toast.info("Lembrete importante", {
      description: "Você tem uma reunião agendada para amanhã às 14h.",
      icon: <Info className="h-4 w-4" />
    });
  };

  const showWarningToast = () => {
    toast.warning("Atenção necessária", {
      description: "Seu plano expira em 3 dias. Considere a renovação.",
      icon: <AlertTriangle className="h-4 w-4" />
    });
  };

  const showCustomToast = () => {
    toast("Processando seu pedido", {
      description: "Isso pode levar alguns instantes...",
      duration: 3000
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Demonstração de Notificações</CardTitle>
        <CardDescription>
          Clique nos botões abaixo para visualizar diferentes tipos de notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button variant="default" onClick={showSuccessToast} className="w-full">
          <CheckCircle className="mr-2 h-4 w-4" />
          Notificação de Sucesso
        </Button>
        <Button variant="destructive" onClick={showErrorToast} className="w-full">
          <AlertCircle className="mr-2 h-4 w-4" />
          Notificação de Erro
        </Button>
        <Button variant="outline" onClick={showInfoToast} className="w-full">
          <Info className="mr-2 h-4 w-4" />
          Notificação Informativa
        </Button>
        <Button variant="secondary" onClick={showWarningToast} className="w-full">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Notificação de Aviso
        </Button>
        <Button variant="ghost" onClick={showCustomToast} className="w-full">
          Notificação Personalizada
        </Button>
      </CardContent>
    </Card>
  );
}
