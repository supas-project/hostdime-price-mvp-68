
import { ComponentOption } from "@/types/component";

/**
 * Normaliza o nome do componente removendo caracteres especiais, espaços e acentos
 * para permitir correspondência flexível entre diferentes fontes de dados
 */
export function normalizeComponentName(name: string): string {
  if (!name) return "";
  
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // Remove acentos
    .replace(/[^a-z0-9]/g, "");       // Remove caracteres especiais
}

/**
 * Verifica se dois componentes representam o mesmo item,
 * mesmo que tenham sido obtidos de fontes de dados diferentes
 */
export function isSameComponent(comp1: ComponentOption, comp2: ComponentOption): boolean {
  if (!comp1 || !comp2) return false;
  
  // Verificar se os IDs são idênticos
  if (comp1.id === comp2.id) return true;
  
  // Verificar se os nomes são idênticos
  if (comp1.name === comp2.name) return true;
  
  // Verificar se os nomes normalizados são idênticos
  const name1 = normalizeComponentName(comp1.name);
  const name2 = normalizeComponentName(comp2.name);
  
  if (name1 === name2 && name1 !== "") return true;
  
  // Se ambos têm o mesmo tipo e subtipo, e seus nomes normalizados são semelhantes
  if (comp1.type === comp2.type && 
      comp1.subtype === comp2.subtype && 
      name1.includes(name2) || name2.includes(name1)) {
    return true;
  }
  
  return false;
}

/**
 * Encontra um componente no array de opções com base em um componente de referência
 */
export function findMatchingComponent(
  reference: ComponentOption, 
  options: ComponentOption[]
): ComponentOption | null {
  if (!reference || !Array.isArray(options) || options.length === 0) return null;
  
  // Tenta encontrar correspondência exata por ID
  const idMatch = options.find(option => option.id === reference.id);
  if (idMatch) return idMatch;
  
  // Tenta encontrar correspondência por nome exato
  const nameMatch = options.find(option => option.name === reference.name);
  if (nameMatch) return nameMatch;
  
  // Tenta encontrar correspondência por nome normalizado
  const refName = normalizeComponentName(reference.name);
  const normalizedMatch = options.find(option => 
    normalizeComponentName(option.name) === refName
  );
  
  if (normalizedMatch) return normalizedMatch;
  
  // Tenta encontrar correspondência por tipo e subtipo se disponíveis
  if (reference.type && reference.subtype) {
    const typeMatch = options.find(option => 
      option.type === reference.type && 
      option.subtype === reference.subtype
    );
    if (typeMatch) return typeMatch;
  }
  
  return null;
}
