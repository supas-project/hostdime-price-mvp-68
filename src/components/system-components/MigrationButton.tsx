
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Play, CheckCircle } from 'lucide-react';
import { DataMigrationService } from '@/services/data-migration-service';
import { toast } from 'sonner';

export function MigrationButton() {
  const [isRunning, setIsRunning] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<{
    needed: boolean;
    summary: string;
  } | null>(null);

  const checkStatus = async () => {
    try {
      const status = await DataMigrationService.checkMigrationStatus();
      setMigrationStatus(status);
    } catch (error) {
      console.error('Error checking migration status:', error);
      toast.error('Erro ao verificar status da migração');
    }
  };

  const runMigration = async () => {
    setIsRunning(true);
    try {
      await DataMigrationService.runCompleteMigration();
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
          Migração de Dados Estáticos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {migrationStatus ? (
            <div>
              <p><strong>Status:</strong> {migrationStatus.summary}</p>
              {migrationStatus.needed ? (
                <p className="text-amber-600 mt-1">
                  ⚠️ Migração necessária - Banco de dados vazio
                </p>
              ) : (
                <p className="text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Dados já migrados
                </p>
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
            {isRunning ? 'Migrando...' : 'Executar Migração'}
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
          Esta migração copia todos os dados estáticos (CPUs, memória, OS, conectividade, data centers e contratos) 
          para o banco de dados, permitindo que sejam gerenciados através da interface administrativa.
        </p>
      </CardContent>
    </Card>
  );
}
