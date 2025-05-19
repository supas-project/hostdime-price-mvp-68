
export interface StorageType {
  id: string;
  name: string;
  description: string;
  price: number;
  pricePerGB: number;
  type: string;
  subtype: string;
  specs: string[];
  minCapacity: number;
  maxCapacity: number;
  capacityUnit: string;
  capacityStep: number;
  benefits: string[];
}
