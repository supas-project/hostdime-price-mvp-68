
import { StorageType } from '../types/storage-types';

export async function loadStorageTypes(): Promise<StorageType[]> {
  // Return static storage types that match the StorageType interface
  return [
    {
      id: 'ssd-standard',
      name: 'SSD Standard',
      description: 'SSD padrão para uso geral',
      price: 150,
      pricePerGB: 0.50,
      type: 'ssd',
      subtype: 'standard',
      specs: ['3000 IOPS', '125 MB/s throughput'],
      minCapacity: 100,
      maxCapacity: 2000,
      capacityUnit: 'GB',
      capacityStep: 50,
      benefits: ['Performance balanceada', 'Custo-benefício ideal']
    },
    {
      id: 'ssd-premium',
      name: 'SSD Premium',
      description: 'SSD de alta performance',
      price: 280,
      pricePerGB: 1.00,
      type: 'ssd',
      subtype: 'premium',
      specs: ['16000 IOPS', '250 MB/s throughput'],
      minCapacity: 100,
      maxCapacity: 4000,
      capacityUnit: 'GB',
      capacityStep: 50,
      benefits: ['Alta performance', 'Baixa latência']
    },
    {
      id: 'nvme',
      name: 'NVMe',
      description: 'Storage NVMe ultra-rápido',
      price: 350,
      pricePerGB: 2.00,
      type: 'nvme',
      subtype: 'ultra',
      specs: ['80000 IOPS', '2000 MB/s throughput'],
      minCapacity: 100,
      maxCapacity: 8000,
      capacityUnit: 'GB',
      capacityStep: 100,
      benefits: ['Performance máxima', 'Ideal para aplicações críticas']
    }
  ];
}
