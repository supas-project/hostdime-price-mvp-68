
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { CoreMigrationService, MigrationStatus } from '@/services/data-migration/core-migration-service';
import { toast } from 'sonner';

export function MigrationButton() {
  const [isRunning, setIsRunning] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);

  const checkStatus = async () => {
    try {
      const status = await CoreMigrationService.checkMigrationStatus();
      setMigrationStatus(status);
    } catch (error) {
      console.error('Error checking migration status:', error);
      toast.error('Erro ao verificar status da migração');
    }
  };

  const runMigration = async () => {
    setIsRunning(true);
    try {
      await CoreMigrationService.runProductionMigration();
      await checkStatus(); // Update status after migration
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  React.useEffect(() => {
    checkStatus();
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Migração de Dados para Produção
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {migrationStatus ? (
            <div>
              <p><strong>Status:</strong> {migrationStatus.summary}</p>
              {migrationStatus.needed ? (
                <div className="flex items-center gap-2 mt-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Migração necessária - {migrationStatus.totalMissing} itens faltando</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Todos os dados migrados para produção</span>
                </div>
              )}
              
              {migrationStatus.totalMissing > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>CPUs: {migrationStatus.details.cpu}</div>
                  <div>Memória: {migrationStatus.details.memory}</div>
                  <div>Storage: {migrationStatus.details.storage}</div>
                  <div>DCs: {migrationStatus.details.datacenters}</div>
                </div>
              )}
            </div>
          ) : (
            <p>Verificando status...</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={runMigration}
            disabled={isRunning}
            variant={migrationStatus?.needed ? "default" : "outline"}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Migrando para Produção...' : 'Executar Migração Completa'}
          </Button>
          
          <Button
            onClick={checkStatus}
            variant="outline"
            size="sm"
          >
            Verificar Status
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Esta migração prepara todos os dados para produção, incluindo componentes do sistema, 
          storage, data centers, contratos e configurações otimizadas para ambiente de produção.
        </p>
      </CardContent>
    </Card>
  );
}
