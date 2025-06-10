
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Database, CheckCircle, AlertTriangle, ArrowRight, Trash2, Bug, Zap } from 'lucide-react';
import { DataMigrationService } from '@/services/data-migration-service';
import { DirectMigrationService } from '@/services/direct-migration-service';
import { toast } from 'sonner';

interface MigrationStatus {
  totalCategories: number;
  totalItems: number;
  itemsByCategory: Record<string, number>;
  isHealthy: boolean;
  errors: string[];
}

export function MigrationPanel() {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isDirectMigrating, setIsDirectMigrating] = useState(false);

  const loadMigrationStatus = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Carregando status da migração...');
      const status = await DataMigrationService.checkMigrationStatus();
      setMigrationStatus(status);
      
      if (status.errors.length > 0) {
        console.error('❌ Erros no status:', status.errors);
      } else {
        console.log('✅ Status carregado com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar status da migração:', error);
      toast.error('Erro ao carregar status da migração');
      setMigrationStatus({
        totalCategories: 0,
        totalItems: 0,
        itemsByCategory: {},
        isHealthy: false,
        errors: [`Erro ao carregar: ${error}`]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectMigration = async () => {
    try {
      setIsDirectMigrating(true);
      console.log('🚀 Iniciando migração direta...');
      
      await DirectMigrationService.executeFullMigration();
      
      // Aguardar um momento antes de verificar o status
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadMigrationStatus();
      
      toast.success('Migração direta realizada com sucesso!');
      console.log('✅ Migração direta concluída');
    } catch (error) {
      console.error('❌ Erro na migração direta:', error);
      toast.error(`Erro na migração direta: ${error}`);
    } finally {
      setIsDirectMigrating(false);
    }
  };

  const handleMigration = async () => {
    try {
      setIsMigrating(true);
      console.log('🔄 Iniciando migração de dados...');
      
      // Validar dados estáticos primeiro
      const validation = DataMigrationService.validateStaticData();
      if (!validation.isValid) {
        toast.error(`Dados estáticos inválidos: ${validation.errors.join(', ')}`);
        return;
      }

      await DataMigrationService.migrateAllDataToPricingTable();
      
      // Aguardar um momento antes de verificar o status
      await new Promise(resolve => setTimeout(resolve, 1500));
      await loadMigrationStatus();
      
      toast.success('Migração realizada com sucesso!');
      console.log('✅ Migração concluída');
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      toast.error(`Erro na migração de dados: ${error}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Tem certeza que deseja limpar todos os dados migrados? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setIsClearing(true);
      console.log('🗑️ Limpando dados migrados...');
      
      await DataMigrationService.clearMigratedData();
      await loadMigrationStatus();
      
      toast.success('Dados limpos com sucesso!');
      console.log('✅ Limpeza concluída');
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
      toast.error(`Erro ao limpar dados: ${error}`);
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    loadMigrationStatus();
  }, []);

  const hasData = migrationStatus && migrationStatus.totalItems > 0;
  const itemsByCategory = migrationStatus?.itemsByCategory || {};

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
        {/* Status de saúde */}
        {migrationStatus && (
          <div className={`p-3 rounded-lg border ${migrationStatus.isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Status do Sistema</span>
              <Badge variant={migrationStatus.isHealthy ? 'default' : 'destructive'}>
                {migrationStatus.isHealthy ? 'Saudável' : 'Com Problemas'}
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

            {/* Erros */}
            {migrationStatus.errors.length > 0 && (
              <div className="mt-3 pt-3 border-t border-red-300">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Erros encontrados:</span>
                </div>
                <ul className="text-sm text-red-600 space-y-1">
                  {migrationStatus.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span>•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Distribuição por categoria */}
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
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={handleDirectMigration}
            disabled={isDirectMigrating || isLoading || isClearing || isMigrating}
            className="flex-1 min-w-[200px]"
            variant="default"
          >
            {isDirectMigrating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Migrando Diretamente...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Migração Direta
              </>
            )}
          </Button>

          <Button 
            onClick={handleMigration}
            disabled={isMigrating || isLoading || isClearing || isDirectMigrating}
            className="flex-1 min-w-[200px]"
            variant="outline"
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
            disabled={isLoading || isMigrating || isClearing || isDirectMigrating}
            title="Atualizar Status"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {hasData && (
            <Button 
              variant="outline"
              onClick={handleClearData}
              disabled={isLoading || isMigrating || isClearing || isDirectMigrating}
              className="text-red-600 hover:text-red-700"
              title="Limpar Dados Migrados"
            >
              {isClearing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Status de sucesso */}
        {migrationStatus?.isHealthy && hasData && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Dados migrados e sincronizados com sucesso</span>
          </div>
        )}

        {/* Informações sobre a migração direta */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Zap className="h-4 w-4" />
            <span className="font-medium">Migração Direta</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• <strong>Recomendado:</strong> Usa JavaScript em vez de SQL complexo</p>
            <p>• <strong>Mais confiável:</strong> Evita problemas de compatibilidade SQL</p>
            <p>• <strong>Controle total:</strong> Validação e inserção item por item</p>
            <p>• <strong>Resultado garantido:</strong> Dados estáticos transferidos corretamente</p>
          </div>
        </div>

        {/* Debug info */}
        {migrationStatus && !migrationStatus.isHealthy && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <Bug className="h-4 w-4" />
              <span className="font-medium">Informações de Debug</span>
            </div>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>• Verifique o console do navegador para logs detalhados</p>
              <p>• Tente a migração direta se a migração padrão falhar</p>
              <p>• Certifique-se de que as configurações estáticas estão disponíveis</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
