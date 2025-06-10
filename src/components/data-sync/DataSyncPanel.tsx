
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDataSynchronization } from '@/hooks/useDataSynchronization';
import { UnifiedDataService } from '@/services/unified-data-service';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Database, Info } from 'lucide-react';

export function DataSyncPanel() {
  const { isSyncing, lastSyncTime, synchronizeData, checkConsistency } = useDataSynchronization();
  const [consistencyReport, setConsistencyReport] = useState<any>(null);
  const [consolidationStatus, setConsolidationStatus] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  
  useEffect(() => {
    const loadStatus = async () => {
      const [report, status] = await Promise.all([
        checkConsistency(),
        UnifiedDataService.getConsolidationStatus()
      ]);
      
      setConsistencyReport(report);
      setConsolidationStatus(status);
    };
    
    loadStatus();
  }, [checkConsistency]);
  
  const handleSynchronize = async () => {
    try {
      console.log('[DataSyncPanel] Starting unified data synchronization...');
      
      const success = await synchronizeData();
      
      if (success) {
        // Refresh status after sync
        const [report, status] = await Promise.all([
          checkConsistency(),
          UnifiedDataService.getConsolidationStatus()
        ]);
        
        setConsistencyReport(report);
        setConsolidationStatus(status);
      }
    } catch (error) {
      console.error('[DataSyncPanel] Synchronization error:', error);
    }
  };
  
  const needsConsolidation = consolidationStatus?.phase !== 'completed';
  
  // Safely check for issues with proper null checks and default values
  const hasIssues = consistencyReport && (
    (consistencyReport.missingInPrice && consistencyReport.missingInPrice.length > 0) ||
    (consistencyReport.extraInPrice && consistencyReport.extraInPrice.length > 0) ||
    (consistencyReport.itemMismatches && Object.keys(consistencyReport.itemMismatches).length > 0)
  );
  
  const getStatusInfo = () => {
    if (needsConsolidation) {
      return {
        icon: <Info className="w-4 h-4 text-blue-500" />,
        message: 'Dados precisam ser consolidados',
        variant: 'default'
      };
    }
    
    if (hasIssues) {
      return {
        icon: <AlertTriangle className="w-4 h-4 text-destructive" />,
        message: 'Divergências detectadas',
        variant: 'destructive'
      };
    }
    
    return {
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      message: 'Dados unificados sincronizados',
      variant: 'success'
    };
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Sincronização de Dados Unificados
        </CardTitle>
        <CardDescription>
          Sincronize os dados unificados com a tabela de preços para garantir consistência
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Consolidation Status */}
        {consolidationStatus && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-900">Status da Consolidação</span>
              <Badge variant={consolidationStatus.phase === 'completed' ? 'default' : 'secondary'}>
                {consolidationStatus.phase}
              </Badge>
            </div>
            <div className="text-sm text-blue-700">
              <p>Componentes: {consolidationStatus.components_count || 0}</p>
              <p>Storage: {consolidationStatus.storage_count || 0}</p>
              <p>Data Centers: {consolidationStatus.datacenters_count || 0}</p>
              <p>Contratos: {consolidationStatus.contracts_count || 0}</p>
            </div>
          </div>
        )}
        
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <span className="text-sm">{statusInfo.message}</span>
          </div>
          
          {lastSyncTime && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {lastSyncTime.toLocaleTimeString()}
            </div>
          )}
        </div>
        
        {/* Issues Report - with safe checks */}
        {hasIssues && consistencyReport && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                {consistencyReport.missingInPrice && consistencyReport.missingInPrice.length > 0 && (
                  <p>
                    <strong>{consistencyReport.missingInPrice.length}</strong> categorias padrão ausentes na tabela de preços
                  </p>
                )}
                {consistencyReport.extraInPrice && consistencyReport.extraInPrice.length > 0 && (
                  <p>
                    <strong>{consistencyReport.extraInPrice.length}</strong> categorias não-padrão na tabela de preços
                  </p>
                )}
                {consistencyReport.itemMismatches && Object.keys(consistencyReport.itemMismatches).length > 0 && (
                  <p>
                    <strong>{Object.keys(consistencyReport.itemMismatches).length}</strong> categorias com itens divergentes
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleSynchronize}
            disabled={isSyncing}
            variant={needsConsolidation || hasIssues ? "default" : "outline"}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {needsConsolidation ? 'Consolidando e sincronizando...' : 'Sincronizando dados unificados...'}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {needsConsolidation ? 'Consolidar e Sincronizar' : hasIssues ? 'Corrigir Divergências' : 'Verificar Sincronização'}
              </>
            )}
          </Button>
          
          {consistencyReport && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowReport(!showReport)}
            >
              {showReport ? 'Ocultar' : 'Ver'} Detalhes
            </Button>
          )}
        </div>
        
        {/* Detailed Report - with safe checks */}
        {showReport && consistencyReport && (
          <div className="space-y-3 p-3 bg-muted rounded-lg">
            {consistencyReport.missingInPrice && consistencyReport.missingInPrice.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Categorias padrão ausentes na tabela de preços:</h4>
                <div className="flex flex-wrap gap-1">
                  {consistencyReport.missingInPrice.map((cat: string) => (
                    <Badge key={cat} variant="destructive">{cat}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {consistencyReport.extraInPrice && consistencyReport.extraInPrice.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Categorias não-padrão na tabela de preços:</h4>
                <div className="flex flex-wrap gap-1">
                  {consistencyReport.extraInPrice.map((cat: string) => (
                    <Badge key={cat} variant="secondary">{cat}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {consistencyReport.itemMismatches && Object.keys(consistencyReport.itemMismatches).length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Divergências de itens por categoria:</h4>
                <div className="space-y-1">
                  {Object.entries(consistencyReport.itemMismatches).map(([cat, mismatch]: [string, any]) => (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span>{cat}</span>
                      <div className="flex gap-2">
                        {mismatch.missing > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            -{mismatch.missing} ausentes
                          </Badge>
                        )}
                        {mismatch.extra > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            +{mismatch.extra} extras
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            <strong>Fonte Única:</strong> Todos os dados agora vêm do UnifiedDataService, 
            garantindo consistência entre configurações e tabela de preços.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
