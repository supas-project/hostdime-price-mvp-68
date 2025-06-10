
import { StorageType } from '../types/storage-types';

export async function loadStorageTypes(): Promise<StorageType[]> {
  // Return static storage types
  return [
    {
      id: 'ssd-standard',
      name: 'SSD Standard',
      pricePerGB: 0.50,
      iops: '3000 IOPS',
      throughput: '125 MB/s',
      description: 'SSD padrão para uso geral'
    },
    {
      id: 'ssd-premium',
      name: 'SSD Premium',
      pricePerGB: 1.00,
      iops: '16000 IOPS',
      throughput: '250 MB/s',
      description: 'SSD de alta performance'
    },
    {
      id: 'nvme',
      name: 'NVMe',
      pricePerGB: 2.00,
      iops: '80000 IOPS',
      throughput: '2000 MB/s',
      description: 'Storage NVMe ultra-rápido'
    }
  ];
}
