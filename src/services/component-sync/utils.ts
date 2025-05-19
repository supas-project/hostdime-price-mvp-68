
// Constants for category mapping
export const CATEGORY_MAPPING = {
  cpu: "Processador",
  memory: "Memória RAM",
  storage: "Armazenamento",
  os: "Sistema Operacional",
  datacenter: "Datacenter",
  contract: "Duração do Contrato",
  connectivity: "Opções de Conectividade",
  services: "Serviços Adicionais",
  disks: "Discos",
  external_storage: "Storage Externo"
};

// Reverse mapping for lookups
export const REVERSE_CATEGORY_MAPPING: Record<string, string> = {};
Object.entries(CATEGORY_MAPPING).forEach(([key, value]) => {
  REVERSE_CATEGORY_MAPPING[value.toLowerCase()] = key;
});
