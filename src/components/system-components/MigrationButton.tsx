
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Play, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useUnifiedData } from '@/hooks/useUnifiedData';

export function MigrationButton() {
  const { 
    loading, 
    consolidationStatus, 
    consolidateData, 
    loadConsolidationStatus 
  } = useUnifiedData();

  const handleConsolidateData = async () => {
    await consolidateData();
  };

  const handleRefreshStatus = async () => {
    await loadConsolidationStatus();
  };

  React.useEffect(() => {
    loadConsolidationStatus();
  }, []);

  const isCompleted = consolidationStatus?.phase === 'completed';
  const isError = consolidationStatus?.phase === 'error';
  const isConsolidating = consolidationStatus?.phase === 'consolidating';
  
  const getStatusColor = () => {
    if (isCompleted) return 'text-green-600';
    if (isError) return 'text-red-600';
    if (isConsolidating) return 'text-blue-600';
    return 'text-amber-600';
  };

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle className="h-4 w-4" />;
    if (isError) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Consolidação de Dados para Produção
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {consolidationStatus ? (
          <div>
            <div className={`flex items-center gap-2 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="font-medium">
                Status: {consolidationStatus.phase === 'completed' ? 'Completa' :
                        consolidationStatus.phase === 'consolidating' ? 'Em andamento' :
                        consolidationStatus.phase === 'error' ? 'Erro' : 'Pendente'}
              </span>
            </div>
            
            {(consolidationStatus.components_count > 0 || consolidationStatus.datacenters_count > 0) && (
              <div className="mt-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Dados consolidados:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-1">
                  <div>Componentes: {consolidationStatus.components_count}</div>
                  <div>Data Centers: {consolidationStatus.datacenters_count}</div>
                  <div>Contratos: {consolidationStatus.contracts_count}</div>
                  <div>Storage: {consolidationStatus.storage_count}</div>
                </div>
              </div>
            )}

            {consolidationStatus.errors.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm font-medium text-red-800">Erros encontrados:</p>
                <ul className="text-xs text-red-600 mt-1">
                  {consolidationStatus.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            <p>Verificando status da consolidação...</p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={handleConsolidateData}
            disabled={loading || isConsolidating}
            variant={isCompleted ? "outline" : "default"}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {loading || isConsolidating ? 'Consolidando...' : 
             isCompleted ? 'Reconsolidar Dados' : 'Consolidar Dados'}
          </Button>
          
          <Button
            onClick={handleRefreshStatus}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar Status
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Consolidação de dados:</strong> Migra todos os dados estáticos para o banco de dados, 
            eliminando dependências de arquivos locais e preparando o sistema para produção.
          </p>
          <p>
            <strong>Benefícios:</strong> Dados centralizados, gestão via interface admin, 
            performance otimizada e escalabilidade melhorada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
