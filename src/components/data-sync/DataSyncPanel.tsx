
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDataSynchronization } from '@/hooks/useDataSynchronization';
import { Sync, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function DataSyncPanel() {
  const { isSyncing, lastSyncTime, synchronizeData, checkConsistency } = useDataSynchronization();
  const [consistencyReport, setConsistencyReport] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  
  useEffect(() => {
    // Check consistency on mount
    const loadConsistency = async () => {
      const report = await checkConsistency();
      setConsistencyReport(report);
    };
    
    loadConsistency();
  }, [checkConsistency]);
  
  const handleSynchronize = async () => {
    const success = await synchronizeData();
    if (success) {
      // Refresh consistency report
      const report = await checkConsistency();
      setConsistencyReport(report);
    }
  };
  
  const hasIssues = consistencyReport && (
    consistencyReport.missingInPrice.length > 0 ||
    consistencyReport.extraInPrice.length > 0 ||
    Object.keys(consistencyReport.itemMismatches).length > 0
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sync className="w-5 h-5" />
          Sincronização de Dados
        </CardTitle>
        <CardDescription>
          Mantenha a configuração e tabela de preços sincronizadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasIssues ? (
              <>
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm">Divergências detectadas</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Dados sincronizados</span>
              </>
            )}
          </div>
          
          {lastSyncTime && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {lastSyncTime.toLocaleTimeString()}
            </div>
          )}
        </div>
        
        {/* Issues Report */}
        {hasIssues && consistencyReport && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                {consistencyReport.missingInPrice.length > 0 && (
                  <p>
                    <strong>{consistencyReport.missingInPrice.length}</strong> categorias ausentes na tabela de preços
                  </p>
                )}
                {consistencyReport.extraInPrice.length > 0 && (
                  <p>
                    <strong>{consistencyReport.extraInPrice.length}</strong> categorias extras na tabela de preços
                  </p>
                )}
                {Object.keys(consistencyReport.itemMismatches).length > 0 && (
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
            variant={hasIssues ? "default" : "outline"}
          >
            {isSyncing ? (
              <>
                <Sync className="w-4 h-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <Sync className="w-4 h-4 mr-2" />
                {hasIssues ? 'Corrigir Divergências' : 'Verificar Novamente'}
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
        
        {/* Detailed Report */}
        {showReport && consistencyReport && (
          <div className="space-y-3 p-3 bg-muted rounded-lg">
            {consistencyReport.missingInPrice.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Categorias ausentes na tabela de preços:</h4>
                <div className="flex flex-wrap gap-1">
                  {consistencyReport.missingInPrice.map((cat: string) => (
                    <Badge key={cat} variant="destructive">{cat}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {consistencyReport.extraInPrice.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Categorias extras na tabela de preços:</h4>
                <div className="flex flex-wrap gap-1">
                  {consistencyReport.extraInPrice.map((cat: string) => (
                    <Badge key={cat} variant="secondary">{cat}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {Object.keys(consistencyReport.itemMismatches).length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Divergências de itens:</h4>
                <div className="space-y-1">
                  {Object.entries(consistencyReport.itemMismatches).map(([cat, mismatch]: [string, any]) => (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span>{cat}</span>
                      <div className="flex gap-2">
                        {mismatch.missing > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            -{mismatch.missing}
                          </Badge>
                        )}
                        {mismatch.extra > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            +{mismatch.extra}
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
      </CardContent>
    </Card>
  );
}
