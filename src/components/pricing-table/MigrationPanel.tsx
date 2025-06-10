
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Database, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { DataMigrationService } from '@/services/data-migration-service';
import { toast } from 'sonner';

export function MigrationPanel() {
  const [migrationStatus, setMigrationStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  const loadMigrationStatus = async () => {
    try {
      setIsLoading(true);
      const status = await DataMigrationService.checkMigrationStatus();
      setMigrationStatus(status);
    } catch (error) {
      console.error('Erro ao carregar status da migração:', error);
      toast.error('Erro ao carregar status da migração');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigration = async () => {
    try {
      setIsMigrating(true);
      console.log('🔄 Iniciando migração de dados...');
      
      await DataMigrationService.migrateAllDataToPricingTable();
      await loadMigrationStatus();
      
      toast.success('Migração realizada com sucesso!');
      console.log('✅ Migração concluída');
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      toast.error('Erro na migração de dados');
    } finally {
      setIsMigrating(false);
    }
  };

  useEffect(() => {
    loadMigrationStatus();
  }, []);

  const hasData = migrationStatus && migrationStatus.totalItems > 0;
  const itemsByCategory = migrationStatus?.itemsByCategory && typeof migrationStatus.itemsByCategory === 'object' 
    ? migrationStatus.itemsByCategory as Record<string, number>
    : {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Migração de Dados
        </CardTitle>
        <CardDescription>
          Migre os dados existentes das configurações para a tabela de preços
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status atual */}
        {migrationStatus && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Status Atual</span>
              <Badge variant={hasData ? 'default' : 'secondary'}>
                {hasData ? 'Dados Presentes' : 'Sem Dados'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Categorias:</span>
                <span className="ml-2 font-medium">{migrationStatus.totalCategories}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Itens:</span>
                <span className="ml-2 font-medium">{migrationStatus.totalItems}</span>
              </div>
            </div>

            {Object.keys(itemsByCategory).length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <span className="text-sm font-medium mb-2 block">Itens por categoria:</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(itemsByCategory).map(([type, count]) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informação sobre a migração */}
        <Alert>
          <ArrowRight className="h-4 w-4" />
          <AlertDescription>
            Esta migração vai transferir todos os dados das configurações estáticas 
            (CPUs, memória, OS, etc.) para a tabela de preços no banco de dados, 
            criando uma única fonte de verdade.
          </AlertDescription>
        </Alert>

        {/* Ações */}
        <div className="flex gap-2">
          <Button 
            onClick={handleMigration}
            disabled={isMigrating || isLoading}
            className="flex-1"
          >
            {isMigrating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Migrando Dados...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                {hasData ? 'Sincronizar Novamente' : 'Migrar Dados'}
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={loadMigrationStatus}
            disabled={isLoading || isMigrating}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Status de sucesso */}
        {hasData && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Dados migrados e sincronizados com sucesso</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
