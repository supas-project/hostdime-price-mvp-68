
import { SystemComponent, DataCenter, ContractType } from '@/services/systemComponentsService';
import { ComponentOption } from '@/types/component';

/**
 * Adapter service to convert database components to application format
 */
export class ComponentDataAdapter {
  static convertSystemComponentToComponentOption(component: SystemComponent): ComponentOption {
    return {
      id: component.component_id,
      name: component.name,
      description: component.description || '',
      price: component.price,
      type: component.component_type,
      subtype: component.subtype,
      isHardware: component.is_hardware,
      specs: component.specs || [],
      metadata: component.metadata || {}
    };
  }

  static convertDataCenterToComponentOption(dataCenter: DataCenter): ComponentOption {
    return {
      id: dataCenter.datacenter_id,
      name: dataCenter.name,
      description: dataCenter.description || '',
      price: dataCenter.price,
      type: 'datacenter',
      specs: [
        `Localização: ${dataCenter.location}`,
        `Região: ${dataCenter.region || 'N/A'}`,
        ...(dataCenter.features || [])
      ],
      metadata: {
        location: dataCenter.location,
        region: dataCenter.region,
        badge: dataCenter.badge,
        features: dataCenter.features,
        certifications: dataCenter.certifications
      }
    };
  }

  static convertContractTypeToComponentOption(contractType: ContractType): ComponentOption {
    return {
      id: contractType.contract_id,
      name: contractType.name,
      description: contractType.description || '',
      price: 0, // Contracts don't have direct price, they apply discounts
      type: 'contrato',
      specs: [
        `Duração: ${contractType.duration_months} meses`,
        `Desconto: ${contractType.discount_percentage}%`
      ],
      metadata: {
        duration: contractType.duration_months,
        discount: contractType.discount_percentage
      }
    };
  }

  static convertSystemComponentsToOptions(components: SystemComponent[]): ComponentOption[] {
    return components.map(component => this.convertSystemComponentToComponentOption(component));
  }

  static convertDataCentersToOptions(dataCenters: DataCenter[]): ComponentOption[] {
    return dataCenters.map(dc => this.convertDataCenterToComponentOption(dc));
  }

  static convertContractTypesToOptions(contractTypes: ContractType[]): ComponentOption[] {
    return contractTypes.map(ct => this.convertContractTypeToComponentOption(ct));
  }
}
