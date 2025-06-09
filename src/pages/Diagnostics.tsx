import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiagnosticReport, DiagnosticResult, diagnosticService } from "@/services/diagnostic-service";
import { RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

export default function Diagnostics() {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin, isAuthenticated } = useAuth();

  // Only allow admins to access this page
  if (!isAdmin || !isAuthenticated) {
    toast.error("Acesso negado", {
      description: "Você precisa ser administrador para acessar esta página."
    });
    return <Navigate to="/login" replace />;
  }

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const newReport = await diagnosticService.runAllDiagnostics();
      setReport(newReport);
      toast.success("Diagnóstico concluído");
    } catch (error) {
      console.error("Erro ao executar diagnóstico:", error);
      toast.error("Erro ao executar diagnóstico", {
        description: "Ocorreu um erro ao tentar executar o diagnóstico."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    }).format(date);
  };

  const renderStatusBadge = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Sucesso</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Erro</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendente</Badge>;
      default:
        return null;
    }
  };

  const renderResultIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const ResultItem = ({ result }: { result: DiagnosticResult }) => (
    <div className="border rounded-md p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {renderResultIcon(result.status)}
          <h3 className="font-medium">{result.name}</h3>
        </div>
        {renderStatusBadge(result.status)}
      </div>
      <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Latência: {result.latency ? `${Math.round(result.latency)}ms` : 'N/A'}</span>
        <span>Timestamp: {formatDate(result.timestamp)}</span>
      </div>
    </div>
  );

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Diagnóstico Supabase</CardTitle>
              <CardDescription>Validação da conexão com o Supabase em ambiente de produção</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runDiagnostics} 
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && !report ? (
            <div className="flex flex-col items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Executando diagnósticos...</p>
            </div>
          ) : report ? (
            <>
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ambiente</p>
                    <p className="font-medium">{report.environment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status Geral</p>
                    <div className="flex items-center gap-2">
                      {renderResultIcon(report.overallStatus)}
                      <span className="font-medium">
                        {report.overallStatus === 'success' ? 'Operacional' : 'Problemas Detectados'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Última Verificação</p>
                    <p className="font-medium">{formatDate(report.timestamp)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sessão</p>
                    <p className="font-medium">{report.sessionInfo?.user || 'Nenhuma sessão ativa'}</p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-medium mb-4">Resultados Detalhados</h3>
              <div className="space-y-4">
                {report.results.map((result, index) => (
                  <ResultItem key={index} result={result} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-muted-foreground">Falha ao carregar diagnósticos</p>
              <Button onClick={runDiagnostics} variant="outline" size="sm" className="mt-4">
                Tentar novamente
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-col items-start">
          <p className="text-sm text-muted-foreground mb-2">
            Esta página é visível apenas para administradores e fornece informações de diagnóstico
            sobre a conexão com o Supabase em produção.
          </p>
          {report?.sessionInfo?.expires && (
            <p className="text-xs text-muted-foreground">
              Sessão expira em: {formatDate(report.sessionInfo.expires)}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
