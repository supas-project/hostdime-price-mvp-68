
/**
 * Utility for logging debug messages
 */
export function logDebug(context: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    if (data) {
      console.log(`[${context}]`, data);
    } else {
      console.log(`[${context}]`);
    }
  }
}

/**
 * Parse a number value or string to number
 */
export function parseNumberValue(value: any, defaultValue: number = 0): number {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Category mapping for data structure conversion
 */
export const CATEGORY_MAPPING = {
  'storage': 'Armazenamento Interno',
  'external_storage': 'Storage Externo',
  'disk': 'Discos',
  'memory': 'Memória',
  'processor': 'Processador',
  'contract': 'Contrato',
  'connectivity': 'Conectividade',
  'port_speed': 'Velocidade de Porta',
  'ip_blocks': 'Blocos de IP',
  'datacenter': 'DataCenter',
  'sistemaoperacional': 'Sistema Operacional',
  'serviçospersonalizados': 'Serviços Personalizados'
};
