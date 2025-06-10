
import { supabase } from '@/integrations/supabase/client';

/**
 * Serviço para migração direta dos dados estáticos para a tabela de preços
 * usando inserções diretas em JavaScript para contornar problemas de SQL
 */
export class DirectMigrationService {
  
  /**
   * Executa a migração completa dos dados estáticos
   */
  static async executeFullMigration(): Promise<void> {
    console.log('[DirectMigrationService] 🚀 Iniciando migração direta completa...');
    
    try {
      // 1. Inserir categorias básicas
      await this.insertBasicCategories();
      
      // 2. Inserir dados de cada tipo de componente
      await this.insertCPUData();
      await this.insertMemoryData();
      await this.insertOSData();
      await this.insertConnectivityData();
      await this.insertDataCenterData();
      await this.insertContractData();
      
      console.log('[DirectMigrationService] ✅ Migração direta completa realizada com sucesso');
    } catch (error) {
      console.error('[DirectMigrationService] ❌ Erro na migração direta:', error);
      throw error;
    }
  }

  /**
   * Inserir categorias básicas
   */
  private static async insertBasicCategories(): Promise<void> {
    console.log('[DirectMigrationService] 📂 Inserindo categorias básicas...');
    
    const categories = [
      { name: 'Processadores', component_type: 'cpu', display_order: 1, description: 'Processadores e CPUs para servidores' },
      { name: 'Memória RAM', component_type: 'memory', display_order: 2, description: 'Módulos de memória RAM para servidores' },
      { name: 'Sistema Operacional', component_type: 'os', display_order: 3, description: 'Sistemas operacionais e licenças' },
      { name: 'Conectividade', component_type: 'connectivity', display_order: 4, description: 'Opções de conectividade e largura de banda' },
      { name: 'Data Centers', component_type: 'datacenter', display_order: 5, description: 'Localização de data centers' },
      { name: 'Contratos', component_type: 'contract', display_order: 6, description: 'Tipos de contrato e durações' }
    ];

    for (const category of categories) {
      try {
        // Verificar se a categoria já existe
        const { data: existing } = await supabase
          .from('component_categories')
          .select('id')
          .eq('component_type', category.component_type)
          .eq('is_active', true)
          .single();

        if (!existing) {
          const { error } = await supabase
            .from('component_categories')
            .insert({
              name: category.name,
              description: category.description,
              component_type: category.component_type,
              display_order: category.display_order,
              is_active: true
            });

          if (error) {
            console.error(`Erro ao inserir categoria ${category.component_type}:`, error);
          } else {
            console.log(`✅ Categoria inserida: ${category.component_type}`);
          }
        } else {
          console.log(`✅ Categoria já existe: ${category.component_type}`);
        }
      } catch (error) {
        console.error(`Erro ao processar categoria ${category.component_type}:`, error);
      }
    }
  }

  /**
   * Inserir dados de CPU
   */
  private static async insertCPUData(): Promise<void> {
    console.log('[DirectMigrationService] 🖥️ Inserindo dados de CPU...');
    
    // Buscar categoria de CPU
    const { data: cpuCategory } = await supabase
      .from('component_categories')
      .select('id')
      .eq('component_type', 'cpu')
      .single();

    if (!cpuCategory) {
      throw new Error('Categoria CPU não encontrada');
    }

    const cpuItems = [
      {
        component_id: 'cpu-1',
        name: 'Intel Xeon E5-2620v3 (15 cores)',
        description: 'Processador ideal para cargas de trabalho moderadas',
        price: 450.00,
        specs: ["Modelo: Intel Xeon E5-2620v3", "Clock Base: 2.4 GHz", "Turbo Boost: Até 3.2 GHz", "Cores: 15 cores físicos", "Threads: 30 threads", "Cache: 15MB L3", "TDP: 85W"],
        metadata: { cores: 15 }
      },
      {
        component_id: 'cpu-2',
        name: 'Intel Xeon Silver 4210 (10 cores)',
        description: 'Excelente para aplicações empresariais',
        price: 730.00,
        specs: ["Modelo: Intel Xeon Silver 4210", "Clock Base: 2.2 GHz", "Turbo Boost: Até 3.2 GHz", "Cores: 10 cores físicos", "Threads: 20 threads", "Cache: 13.75MB", "TDP: 85W"],
        metadata: { cores: 10 }
      },
      {
        component_id: 'cpu-3',
        name: 'Intel Xeon Gold 6248R (24 cores)',
        description: 'Alto desempenho para cargas intensivas',
        price: 1600.00,
        specs: ["Modelo: Intel Xeon Gold 6248R", "Clock Base: 3.0 GHz", "Turbo Boost: Até 4.0 GHz", "Cores: 24 cores físicos", "Threads: 48 threads", "Cache: 35.75MB", "TDP: 205W"],
        metadata: { cores: 24 }
      },
      {
        component_id: 'cpu-4',
        name: 'AMD EPYC 7352 (24 cores)',
        description: 'Ótima relação custo-benefício',
        price: 1300.00,
        specs: ["Modelo: AMD EPYC 7352", "Clock Base: 2.3 GHz", "Turbo Boost: Até 3.2 GHz", "Cores: 24 cores físicos", "Threads: 48 threads", "Cache: 128MB L3", "TDP: 155W"],
        metadata: { cores: 24 }
      },
      {
        component_id: 'cpu-5',
        name: 'AMD EPYC 7502 (32 cores)',
        description: 'Ideal para virtualização e cargas pesadas',
        price: 2200.00,
        specs: ["Modelo: AMD EPYC 7502", "Clock Base: 2.5 GHz", "Turbo Boost: Até 3.35 GHz", "Cores: 32 cores físicos", "Threads: 64 threads", "Cache: 128MB L3", "TDP: 180W"],
        metadata: { cores: 32 }
      },
      {
        component_id: 'cpu-6',
        name: 'AMD EPYC 7742 (64 cores)',
        description: 'Máximo desempenho para aplicações críticas',
        price: 4300.00,
        specs: ["Modelo: AMD EPYC 7742", "Clock Base: 2.25 GHz", "Turbo Boost: Até 3.4 GHz", "Cores: 64 cores físicos", "Threads: 128 threads", "Cache: 256MB L3", "TDP: 225W"],
        metadata: { cores: 64 }
      }
    ];

    await this.insertComponentItems(cpuCategory.id, cpuItems, 'standard', true);
  }

  /**
   * Inserir dados de Memória
   */
  private static async insertMemoryData(): Promise<void> {
    console.log('[DirectMigrationService] 💾 Inserindo dados de Memória...');
    
    const { data: memoryCategory } = await supabase
      .from('component_categories')
      .select('id')
      .eq('component_type', 'memory')
      .single();

    if (!memoryCategory) return;

    const memoryItems = [
      {
        component_id: '64',
        name: '64GB RAM',
        description: 'Memória RAM DDR4 ECC Registered',
        price: 480.00,
        specs: ["Memória RAM DDR4 de alta performance"],
        metadata: {}
      }
    ];

    await this.insertComponentItems(memoryCategory.id, memoryItems, 'standard', true);
  }

  /**
   * Inserir dados de Sistema Operacional
   */
  private static async insertOSData(): Promise<void> {
    console.log('[DirectMigrationService] 🖥️ Inserindo dados de OS...');
    
    const { data: osCategory } = await supabase
      .from('component_categories')
      .select('id')
      .eq('component_type', 'os')
      .single();

    if (!osCategory) return;

    const osItems = [
      {
        component_id: 'os-1',
        name: 'Windows Server 2022 Standard',
        description: 'Sistema operacional Windows Server com suporte completo',
        price: 140.00,
        specs: ["Licença mensal por 2 cores", "Suporte incluído", "Atualizações automáticas"],
        metadata: { perCore: true }
      },
      {
        component_id: 'os-1b',
        name: 'Windows Server 2019 Standard',
        description: 'Sistema operacional Windows Server 2019 com suporte completo',
        price: 120.00,
        specs: ["Licença mensal por 2 cores", "Suporte incluído", "Atualizações automáticas"],
        metadata: { perCore: true }
      },
      {
        component_id: 'os-1c',
        name: 'Windows Server 2016 Standard',
        description: 'Sistema operacional Windows Server 2016 com suporte completo',
        price: 100.00,
        specs: ["Licença mensal por 2 cores", "Suporte incluído", "Atualizações automáticas"],
        metadata: { perCore: true }
      },
      {
        component_id: 'os-2',
        name: 'Ubuntu Server 22.04 LTS',
        description: 'Sistema operacional Linux Ubuntu Server LTS',
        price: 0.00,
        specs: ["Licença gratuita", "Suporte comunitário", "Atualizações por 5 anos"],
        metadata: {}
      },
      {
        component_id: 'os-3',
        name: 'CentOS Stream 9',
        description: 'Sistema operacional Linux CentOS Stream',
        price: 0.00,
        specs: ["Licença gratuita", "Ciclo contínuo de atualizações", "Compatível com RHEL"],
        metadata: {}
      }
    ];

    await this.insertComponentItems(osCategory.id, osItems, 'linux', false);
  }

  /**
   * Inserir dados de Conectividade
   */
  private static async insertConnectivityData(): Promise<void> {
    console.log('[DirectMigrationService] 🌐 Inserindo dados de Conectividade...');
    
    const { data: connectivityCategory } = await supabase
      .from('component_categories')
      .select('id')
      .eq('component_type', 'connectivity')
      .single();

    if (!connectivityCategory) return;

    const connectivityItems = [
      {
        component_id: 'network-1gbps',
        name: '1 Gbps',
        description: 'Porta de rede com velocidade de 1 Gbps',
        price: 50.00,
        specs: [],
        metadata: {}
      },
      {
        component_id: 'network-10gbps',
        name: '10 Gbps',
        description: 'Porta de rede de alta velocidade (10 Gbps)',
        price: 200.00,
        specs: [],
        metadata: {}
      }
    ];

    await this.insertComponentItems(connectivityCategory.id, connectivityItems, 'porta', false);
  }

  /**
   * Inserir dados de Data Centers
   */
  private static async insertDataCenterData(): Promise<void> {
    console.log('[DirectMigrationService] 🏢 Inserindo dados de Data Centers...');
    
    const { data: datacenterCategory } = await supabase
      .from('component_categories')
      .select('id')
      .eq('component_type', 'datacenter')
      .single();

    if (!datacenterCategory) return;

    const datacenterItems = [
      {
        component_id: 'dc-jp',
        name: 'João Pessoa (Nordeste)',
        description: 'Data center localizado no Nordeste do Brasil',
        price: 0.00,
        specs: [],
        metadata: { features: ["Certificação Tier III", "Green Data Center", "Baixa latência regional"], badge: "Recomendado" }
      },
      {
        component_id: 'dc-sp',
        name: 'São Paulo (Sudeste)',
        description: 'Data center localizado no Sudeste do Brasil',
        price: 0.00,
        specs: [],
        metadata: { features: ["Certificação Tier III", "Baixa latência nacional", "Alta conectividade"] }
      },
      {
        component_id: 'dc-orl',
        name: 'Orlando (EUA)',
        description: 'Data center localizado na Flórida, Estados Unidos',
        price: 0.00,
        specs: [],
        metadata: { features: ["Certificação Tier IV", "Conexão global rápida", "Tráfego internacional"], badge: "Internacional" }
      }
    ];

    await this.insertComponentItems(datacenterCategory.id, datacenterItems, 'standard', false);
  }

  /**
   * Inserir dados de Contratos
   */
  private static async insertContractData(): Promise<void> {
    console.log('[DirectMigrationService] 📋 Inserindo dados de Contratos...');
    
    const { data: contractCategory } = await supabase
      .from('component_categories')
      .select('id')
      .eq('component_type', 'contract')
      .single();

    if (!contractCategory) return;

    const contractItems = [
      {
        component_id: 'contract-0',
        name: 'Sem contrato',
        description: 'Pagamento mensal sem compromisso',
        price: 0.00,
        specs: [],
        metadata: { discount: 0 }
      },
      {
        component_id: 'contract-12',
        name: '12 meses',
        description: 'Contrato anual com desconto',
        price: 0.00,
        specs: [],
        metadata: { discount: 5 }
      },
      {
        component_id: 'contract-24',
        name: '24 meses',
        description: 'Contrato de dois anos com desconto',
        price: 0.00,
        specs: [],
        metadata: { discount: 10 }
      },
      {
        component_id: 'contract-36',
        name: '36 meses',
        description: 'Contrato de três anos com desconto',
        price: 0.00,
        specs: [],
        metadata: { discount: 15 }
      },
      {
        component_id: 'contract-48',
        name: '48 meses',
        description: 'Contrato de quatro anos com desconto máximo',
        price: 0.00,
        specs: [],
        metadata: { discount: 20 }
      },
      {
        component_id: 'contract-60',
        name: '60 meses',
        description: 'Contrato de cinco anos com desconto máximo',
        price: 0.00,
        specs: [],
        metadata: { discount: 25 }
      }
    ];

    await this.insertComponentItems(contractCategory.id, contractItems, '0', false);
  }

  /**
   * Método auxiliar para inserir itens de componentes
   */
  private static async insertComponentItems(
    categoryId: string, 
    items: any[], 
    defaultSubtype: string, 
    isHardware: boolean
  ): Promise<void> {
    for (const [index, item] of items.entries()) {
      try {
        // Verificar se o item já existe
        const { data: existing } = await supabase
          .from('component_items')
          .select('id')
          .eq('component_id', item.component_id)
          .eq('is_active', true)
          .single();

        const itemData = {
          category_id: categoryId,
          component_id: item.component_id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          base_price: item.price,
          subtype: defaultSubtype,
          is_hardware: isHardware,
          specs: item.specs || [],
          metadata: item.metadata || {},
          display_order: index,
          is_active: true
        };

        if (existing) {
          // Atualizar item existente
          const { error } = await supabase
            .from('component_items')
            .update(itemData)
            .eq('id', existing.id);

          if (error) {
            console.error(`Erro ao atualizar item ${item.component_id}:`, error);
          } else {
            console.log(`✅ Item atualizado: ${item.component_id}`);
          }
        } else {
          // Criar novo item
          const { error } = await supabase
            .from('component_items')
            .insert(itemData);

          if (error) {
            console.error(`Erro ao criar item ${item.component_id}:`, error);
          } else {
            console.log(`✅ Item criado: ${item.component_id}`);
          }
        }
      } catch (error) {
        console.error(`Erro ao processar item ${item.component_id}:`, error);
      }
    }
  }
}
