
import { ComponentOption } from "@/types/component";
import { PaybackRule, PriceCalculationRequest, PriceCalculationResponse, PriceBreakdown, MemoryScalingRule } from "@/types/pricing";
import { PriceService } from "./price-service";

const PAYBACK_RULES: PaybackRule[] = [
  { contract_duration: 0, payback_factor: 4, description: "Sem contrato" },
  { contract_duration: 12, payback_factor: 6, description: "12 meses" },
  { contract_duration: 24, payback_factor: 10, description: "24 meses" },
  { contract_duration: 36, payback_factor: 14, description: "36 meses" },
  { contract_duration: 48, payback_factor: 20, description: "48 meses" },
  { contract_duration: 60, payback_factor: 26, description: "60 meses" }
];

const MEMORY_SCALING_RULES: MemoryScalingRule[] = [
  { min_gb: 8, max_gb: 256, increment_gb: 16, price_per_gb: 12.50 },
  { min_gb: 257, max_gb: 768, increment_gb: 32, price_per_gb: 11.00 },
  { min_gb: 769, max_gb: 2048, increment_gb: 64, price_per_gb: 9.50 }
];

export class PricingService {
  private static instance: PricingService;

  static getInstance(): PricingService {
    if (!PricingService.instance) {
      PricingService.instance = new PricingService();
    }
    return PricingService.instance;
  }

  async calculatePrice(request: PriceCalculationRequest): Promise<PriceCalculationResponse> {
    try {
      const breakdown = await this.calculatePriceBreakdown(request);
      const appliedRules = this.getAppliedRules(request);
      const warnings = this.generateWarnings(request);
      const recommendations = this.generateRecommendations(request);

      return {
        breakdown,
        applied_rules: appliedRules,
        warnings,
        recommendations
      };
    } catch (error) {
      console.error("Erro no cálculo de preços:", error);
      throw new Error("Erro ao calcular preços");
    }
  }

  private async calculatePriceBreakdown(request: PriceCalculationRequest): Promise<PriceBreakdown> {
    const { configuration, contract_duration, apply_payback } = request;
    
    let hardware_cost = 0;
    let software_cost = 0;
    let services_cost = 0;
    let payback_savings = 0;

    // Calcular custo de hardware com PayBack
    if (configuration.cpu) {
      const cpuPrice = this.calculateComponentPrice(configuration.cpu, contract_duration, apply_payback);
      hardware_cost += cpuPrice.final_price;
      payback_savings += cpuPrice.payback_savings;
    }

    if (configuration.memory) {
      const memoryPrice = this.calculateMemoryPrice(configuration.memory, contract_duration, apply_payback);
      hardware_cost += memoryPrice.final_price;
      payback_savings += memoryPrice.payback_savings;
    }

    // Storage interno
    for (const storage of configuration.storage_internal || []) {
      const storagePrice = this.calculateComponentPrice(storage, contract_duration, apply_payback);
      hardware_cost += storagePrice.final_price;
      payback_savings += storagePrice.payback_savings;
    }

    // Storage externo (sem PayBack)
    for (const storage of configuration.storage_external || []) {
      services_cost += storage.price;
    }

    // Conectividade
    for (const [_, connectivityItem] of Object.entries(configuration.connectivity || {})) {
      const totalPrice = connectivityItem.option.price * connectivityItem.quantity;
      services_cost += totalPrice;
    }

    // Sistema operacional
    if (configuration.operating_system) {
      software_cost += configuration.operating_system.price;
    }

    // Serviços customizados
    for (const service of configuration.custom_services || []) {
      services_cost += service.price;
    }

    const subtotal = hardware_cost + software_cost + services_cost;
    const discounts = 0; // Implementar lógica de desconto se necessário
    const taxes = 0; // Implementar cálculo de impostos se necessário
    const total = subtotal - discounts + taxes;

    return {
      hardware_cost,
      software_cost,
      services_cost,
      payback_savings,
      subtotal,
      discounts,
      taxes,
      total
    };
  }

  private calculateComponentPrice(component: ComponentOption, contractDuration: number, applyPayback: boolean) {
    let final_price = component.price;
    let payback_savings = 0;

    if (applyPayback && component.isHardware) {
      const paybackRule = this.getPaybackRule(contractDuration);
      if (paybackRule) {
        const original_price = component.price;
        final_price = original_price / paybackRule.payback_factor;
        payback_savings = original_price - final_price;
      }
    }

    return { final_price, payback_savings };
  }

  private calculateMemoryPrice(memory: ComponentOption, contractDuration: number, applyPayback: boolean) {
    // Lógica especial para escalonamento de memória
    const memoryGB = this.extractMemorySize(memory.name);
    const scalingRule = this.getMemoryScalingRule(memoryGB);
    
    let base_price = memory.price;
    if (scalingRule) {
      base_price = scalingRule.price_per_gb * memoryGB;
    }

    let final_price = base_price;
    let payback_savings = 0;

    if (applyPayback && memory.isHardware) {
      const paybackRule = this.getPaybackRule(contractDuration);
      if (paybackRule) {
        final_price = base_price / paybackRule.payback_factor;
        payback_savings = base_price - final_price;
      }
    }

    return { final_price, payback_savings };
  }

  private extractMemorySize(name: string): number {
    const match = name.match(/(\d+)\s*GB/i);
    return match ? parseInt(match[1]) : 0;
  }

  private getMemoryScalingRule(memoryGB: number): MemoryScalingRule | null {
    return MEMORY_SCALING_RULES.find(rule => 
      memoryGB >= rule.min_gb && memoryGB <= rule.max_gb
    ) || null;
  }

  private getPaybackRule(contractDuration: number): PaybackRule | null {
    return PAYBACK_RULES.find(rule => rule.contract_duration === contractDuration) || null;
  }

  private getAppliedRules(request: PriceCalculationRequest): string[] {
    const rules: string[] = [];

    if (request.apply_payback) {
      const paybackRule = this.getPaybackRule(request.contract_duration);
      if (paybackRule) {
        rules.push(`PayBack ${paybackRule.payback_factor}x aplicado (${paybackRule.description})`);
      }
    }

    // Verificar regras de memória
    if (request.configuration.memory) {
      const memoryGB = this.extractMemorySize(request.configuration.memory.name);
      const scalingRule = this.getMemoryScalingRule(memoryGB);
      if (scalingRule) {
        rules.push(`Escalonamento de memória: ${scalingRule.increment_gb}GB por faixa`);
      }
    }

    return rules;
  }

  private generateWarnings(request: PriceCalculationRequest): string[] {
    const warnings: string[] = [];

    // Verificar se há componentes sem PayBack em contratos longos
    if (request.contract_duration >= 24 && !request.apply_payback) {
      warnings.push("PayBack não aplicado - considere ativar para contratos de longo prazo");
    }

    // Verificar configuração de RAID
    const internalStorage = request.configuration.storage_internal || [];
    if (internalStorage.length > 1 && !request.configuration.raid_config) {
      warnings.push("Múltiplos discos detectados - considere configurar RAID para redundância");
    }

    return warnings;
  }

  private generateRecommendations(request: PriceCalculationRequest): string[] {
    const recommendations: string[] = [];

    // Recomendar upgrade de contrato
    if (request.contract_duration < 24) {
      recommendations.push("Considere um contrato de 24+ meses para maior economia com PayBack");
    }

    // Recomendar storage externo para grandes volumes
    const internalStorage = request.configuration.storage_internal || [];
    const totalInternalStorage = internalStorage.reduce((total, storage) => {
      const size = this.extractStorageSize(storage.name);
      return total + size;
    }, 0);

    if (totalInternalStorage > 4000) { // 4TB
      recommendations.push("Para grandes volumes, considere storage externo para melhor custo-benefício");
    }

    return recommendations;
  }

  private extractStorageSize(name: string): number {
    const tbMatch = name.match(/(\d+)\s*TB/i);
    if (tbMatch) return parseInt(tbMatch[1]) * 1024;
    
    const gbMatch = name.match(/(\d+)\s*GB/i);
    return gbMatch ? parseInt(gbMatch[1]) : 0;
  }

  getPaybackRules(): PaybackRule[] {
    return PAYBACK_RULES;
  }

  getMemoryScalingRules(): MemoryScalingRule[] {
    return MEMORY_SCALING_RULES;
  }
}

export const pricingService = PricingService.getInstance();
