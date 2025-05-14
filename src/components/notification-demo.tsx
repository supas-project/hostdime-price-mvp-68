
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/utils/toast-utils";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
      icon: <AlertCircle className="h-4 w-4" />,
      duration: 8000, // Longer duration for error
      dismissible: true // User can dismiss manually
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
    // Fix: Using the toast.info method instead of calling toast directly as a function
    toast.info("Processando seu pedido", {
      description: "Isso pode levar alguns instantes...",
      duration: 3000
    });
  };

  // Additional examples to demonstrate importance and durations
  const showImportantNotification = () => {
    toast.error("Ação do sistema necessária", {
      description: "Uma atualização crítica precisa ser instalada imediatamente.",
      icon: <AlertCircle className="h-4 w-4" />,
      important: true,
      duration: 0 // Doesn't auto-dismiss (until manually closed)
    });
  };
  
  const showMultipleNotifications = () => {
    // Show 5 notifications in sequence to demonstrate limit of 3 visible at once
    toast.info("Notificação 1", { description: "Teste de múltiplas notificações" });
    toast.info("Notificação 2", { description: "Teste de múltiplas notificações" });
    toast.info("Notificação 3", { description: "Teste de múltiplas notificações" });
    toast.info("Notificação 4", { description: "Teste de múltiplas notificações" });
    toast.info("Notificação 5", { description: "Teste de múltiplas notificações" });
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
        
        <Separator className="my-2" />
        
        <Button variant="outline" onClick={showImportantNotification} className="w-full border-destructive text-destructive">
          <AlertCircle className="mr-2 h-4 w-4" />
          Notificação Persistente
        </Button>
        <Button variant="outline" onClick={showMultipleNotifications} className="w-full">
          Mostrar Múltiplas Notificações
        </Button>
        
        <p className="text-sm text-muted-foreground mt-3">
          As notificações são exibidas no canto superior direito. Clique no ícone de sino 
          para visualizar todas as notificações anteriores.
        </p>
      </CardContent>
    </Card>
  );
}
