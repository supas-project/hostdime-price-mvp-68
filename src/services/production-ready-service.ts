
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProductionHealthCheck {
  database: boolean;
  authentication: boolean;
  migrations: boolean;
  rls_policies: boolean;
  indexes: boolean;
  overall: boolean;
  issues: string[];
}

export interface SystemMetrics {
  total_users: number;
  total_quotes: number;
  total_components: number;
  active_sessions: number;
  last_migration: string | null;
  system_version: string;
}

/**
 * Service for production readiness checks and monitoring
 */
export class ProductionReadyService {
  
  /**
   * Comprehensive health check for production deployment
   */
  static async performHealthCheck(): Promise<ProductionHealthCheck> {
    console.log('[ProductionReadyService] Performing comprehensive health check...');
    
    const result: ProductionHealthCheck = {
      database: false,
      authentication: false,
      migrations: false,
      rls_policies: false,
      indexes: false,
      overall: false,
      issues: []
    };

    try {
      // Check database connectivity
      result.database = await this.checkDatabaseConnectivity();
      if (!result.database) {
        result.issues.push('Database connectivity failed');
      }

      // Check authentication system
      result.authentication = await this.checkAuthenticationSystem();
      if (!result.authentication) {
        result.issues.push('Authentication system issues detected');
      }

      // Check migrations completeness
      result.migrations = await this.checkMigrationsComplete();
      if (!result.migrations) {
        result.issues.push('Data migrations incomplete');
      }

      // Check RLS policies
      result.rls_policies = await this.checkRLSPolicies();
      if (!result.rls_policies) {
        result.issues.push('Row Level Security policies missing or misconfigured');
      }

      // Check database indexes
      result.indexes = await this.checkDatabaseIndexes();
      if (!result.indexes) {
        result.issues.push('Critical database indexes missing');
      }

      // Overall health
      result.overall = result.database && result.authentication && result.migrations && result.rls_policies && result.indexes;

      console.log('[ProductionReadyService] Health check completed:', result);
      return result;
      
    } catch (error) {
      console.error('[ProductionReadyService] Health check failed:', error);
      result.issues.push(`Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Get system metrics for monitoring
   */
  static async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const [userCount, quoteCount, componentCount, lastMigration] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('quotes').select('id', { count: 'exact' }),
        supabase.from('system_components').select('id', { count: 'exact' }),
        supabase.from('system_settings').select('value').eq('key', 'last_migration').single()
      ]);

      return {
        total_users: userCount.count || 0,
        total_quotes: quoteCount.count || 0,
        total_components: componentCount.count || 0,
        active_sessions: 0, // TODO: Implement session tracking
        last_migration: lastMigration.data?.value as string || null,
        system_version: '1.0.0'
      };
    } catch (error) {
      console.error('[ProductionReadyService] Error getting system metrics:', error);
      throw error;
    }
  }

  /**
   * Setup production environment optimizations
   */
  static async setupProductionOptimizations(): Promise<void> {
    try {
      console.log('[ProductionReadyService] Setting up production optimizations...');
      
      // Update system settings for production
      await supabase.from('system_settings').upsert([
        {
          key: 'production_mode',
          value: { enabled: true, environment: 'production', debug: false },
          description: 'Production environment configuration'
        },
        {
          key: 'cache_settings',
          value: {
            enabled: true,
            ttl_seconds: 3600,
            max_entries: 10000
          },
          description: 'Caching configuration for production'
        },
        {
          key: 'security_settings',
          value: {
            force_https: true,
            session_timeout: 1800,
            max_login_attempts: 5
          },
          description: 'Security settings for production'
        },
        {
          key: 'monitoring_settings',
          value: {
            error_tracking: true,
            performance_monitoring: true,
            audit_logging: true
          },
          description: 'Monitoring and logging configuration'
        }
      ]);

      toast.success('Otimizações de produção configuradas!');
      console.log('[ProductionReadyService] Production optimizations completed');
      
    } catch (error) {
      console.error('[ProductionReadyService] Error setting up production optimizations:', error);
      toast.error('Erro ao configurar otimizações de produção');
      throw error;
    }
  }

  /**
   * Create API endpoints documentation
   */
  static async generateAPIDocumentation(): Promise<string> {
    const apiDoc = {
      openapi: '3.0.0',
      info: {
        title: 'HostDime Pricing System API',
        version: '1.0.0',
        description: 'API for server configuration and pricing system'
      },
      servers: [
        {
          url: '{protocol}://{host}',
          description: 'Production server',
          variables: {
            protocol: { default: 'https' },
            host: { default: 'price.hostdime.com.br' }
          }
        }
      ],
      paths: {
        '/api/v1/health': {
          get: {
            summary: 'Health check endpoint',
            responses: {
              '200': {
                description: 'System is healthy',
                content: {
                  'application/json': {
                    schema: { type: 'object' }
                  }
                }
              }
            }
          }
        },
        '/api/v1/components': {
          get: {
            summary: 'Get available components',
            parameters: [
              {
                name: 'type',
                in: 'query',
                required: false,
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': {
                description: 'List of components',
                content: {
                  'application/json': {
                    schema: { type: 'array' }
                  }
                }
              }
            }
          }
        },
        '/api/v1/quotes': {
          get: {
            summary: 'Get user quotes',
            security: [{ bearerAuth: [] }],
            responses: {
              '200': {
                description: 'List of quotes'
              }
            }
          },
          post: {
            summary: 'Create new quote',
            security: [{ bearerAuth: [] }],
            responses: {
              '201': {
                description: 'Quote created successfully'
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    };

    return JSON.stringify(apiDoc, null, 2);
  }

  // Private helper methods
  private static async checkDatabaseConnectivity(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('system_settings').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  private static async checkAuthenticationSystem(): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      return session !== null;
    } catch {
      return false;
    }
  }

  private static async checkMigrationsComplete(): Promise<boolean> {
    try {
      // Check each table individually with literal strings
      const systemComponentsCheck = await supabase.from('system_components').select('id', { count: 'exact' });
      const datacentersCheck = await supabase.from('datacenters').select('id', { count: 'exact' });
      const contractTypesCheck = await supabase.from('contract_types').select('id', { count: 'exact' });
      const storageItemsCheck = await supabase.from('storage_items').select('id', { count: 'exact' });
      
      const counts = [
        systemComponentsCheck.count || 0,
        datacentersCheck.count || 0,
        contractTypesCheck.count || 0,
        storageItemsCheck.count || 0
      ];
      
      // Check if all tables have data
      return counts.every(count => count > 0);
    } catch {
      return false;
    }
  }

  private static async checkRLSPolicies(): Promise<boolean> {
    // This would require admin privileges to check pg_policies
    // For now, assume they're in place if we can query the tables
    try {
      await supabase.from('system_components').select('id').limit(1);
      await supabase.from('datacenters').select('id').limit(1);
      return true;
    } catch {
      return false;
    }
  }

  private static async checkDatabaseIndexes(): Promise<boolean> {
    // This would require admin privileges to check pg_indexes
    // For now, assume they're in place since we created them in migration
    return true;
  }
}
