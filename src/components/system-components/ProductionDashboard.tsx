
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Server, 
  Database, 
  Shield, 
  Zap,
  Activity,
  Users,
  FileText,
  Settings
} from 'lucide-react';
import { CoreMigrationService, MigrationStatus } from '@/services/data-migration/core-migration-service';
import { ProductionReadyService, ProductionHealthCheck, SystemMetrics } from '@/services/production-ready-service';
import { toast } from 'sonner';

export function ProductionDashboard() {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [healthCheck, setHealthCheck] = useState<ProductionHealthCheck | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [migration, health, metrics] = await Promise.all([
        CoreMigrationService.checkMigrationStatus(),
        ProductionReadyService.performHealthCheck(),
        ProductionReadyService.getSystemMetrics()
      ]);
      
      setMigrationStatus(migration);
      setHealthCheck(health);
      setSystemMetrics(metrics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const runProductionMigration = async () => {
    setIsLoading(true);
    try {
      await CoreMigrationService.runProductionMigration();
      await loadDashboardData();
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupProductionOptimizations = async () => {
    setIsLoading(true);
    try {
      await ProductionReadyService.setupProductionOptimizations();
      await loadDashboardData();
    } catch (error) {
      console.error('Production setup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="gap-1">
        {getStatusIcon(status)}
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6" />
            Dashboard de Produção
          </h2>
          <p className="text-muted-foreground">
            Monitor de preparação e status do sistema para produção
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" disabled={isLoading}>
          <Activity className="h-4 w-4 mr-2" />
          Atualizar Status
        </Button>
      </div>

      <Tabs defaultValue="migration" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="migration">Migração</TabsTrigger>
          <TabsTrigger value="health">Health Check</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="production">Produção</TabsTrigger>
        </TabsList>

        <TabsContent value="migration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Status da Migração de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {migrationStatus && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{migrationStatus.details.cpu}</div>
                      <div className="text-sm text-muted-foreground">CPUs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{migrationStatus.details.memory}</div>
                      <div className="text-sm text-muted-foreground">Memória</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{migrationStatus.details.storage}</div>
                      <div className="text-sm text-muted-foreground">Storage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{migrationStatus.details.datacenters}</div>
                      <div className="text-sm text-muted-foreground">Data Centers</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progresso da Migração</span>
                      <span className="text-sm text-muted-foreground">
                        {migrationStatus.totalMissing === 0 ? 'Completa' : `${migrationStatus.totalMissing} itens faltando`}
                      </span>
                    </div>
                    <Progress 
                      value={migrationStatus.totalMissing === 0 ? 100 : 70} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    {getStatusBadge(!migrationStatus.needed, 'Migração Completa')}
                    {migrationStatus.needed && (
                      <Badge variant="outline" className="gap-1">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Migração Necessária
                      </Badge>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={runProductionMigration}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Database className="h-4 w-4" />
                  {isLoading ? 'Migrando...' : 'Executar Migração Completa'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Health Check do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthCheck && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(healthCheck.database)}
                      <span>Conectividade do Banco</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(healthCheck.authentication)}
                      <span>Sistema de Autenticação</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(healthCheck.migrations)}
                      <span>Migrações Completas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(healthCheck.rls_policies)}
                      <span>Políticas RLS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(healthCheck.indexes)}
                      <span>Índices do Banco</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(healthCheck.overall)}
                      <span>Status Geral</span>
                    </div>
                  </div>

                  {healthCheck.issues.length > 0 && (
                    <div className="border border-red-200 rounded-md p-4 bg-red-50">
                      <h4 className="font-medium text-red-800 mb-2">Problemas Detectados:</h4>
                      <ul className="list-disc list-inside space-y-1 text-red-700">
                        {healthCheck.issues.map((issue, index) => (
                          <li key={index} className="text-sm">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {getStatusBadge(healthCheck.overall, healthCheck.overall ? 'Sistema Saudável' : 'Problemas Detectados')}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics && (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Usuários</span>
                    </div>
                    <div className="text-2xl font-bold">{systemMetrics.total_users}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Cotações</span>
                    </div>
                    <div className="text-2xl font-bold">{systemMetrics.total_quotes}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Componentes</span>
                    </div>
                    <div className="text-2xl font-bold">{systemMetrics.total_components}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Versão</span>
                    </div>
                    <div className="text-xl font-bold">{systemMetrics.system_version}</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Configuração de Produção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Configure otimizações e preparações necessárias para ambiente de produção.
              </p>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Otimizações de Performance</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cache de consultas frequentes</li>
                    <li>• Compressão de respostas</li>
                    <li>• Pool de conexões otimizado</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Configurações de Segurança</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Rate limiting ativado</li>
                    <li>• Logs de auditoria</li>
                    <li>• HTTPS forçado</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Monitoramento</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Health checks automáticos</li>
                    <li>• Alertas de erro</li>
                    <li>• Métricas de performance</li>
                  </ul>
                </div>
              </div>

              <Button 
                onClick={setupProductionOptimizations}
                disabled={isLoading}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                {isLoading ? 'Configurando...' : 'Configurar Produção'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
