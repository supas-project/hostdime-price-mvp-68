
import { PriceItem } from "@/types/pricing";
import { ComponentOption } from "@/types/component";

/**
 * Valida se um item pode ser selecionado no configurador
 * 
 * Um item pode ser selecionado se:
 * - Tem um preço válido (maior ou igual a zero)
 * - Tem um ID válido
 * - É um componente de hardware (isHardware === true) para categorias de hardware
 * 
 * @param item Item a ser validado
 * @returns {boolean} True se o item pode ser selecionado, false caso contrário
 */
export const canSelectItem = (item: PriceItem | ComponentOption): boolean => {
  // Log para debug
  console.log(`Verificando se item pode ser selecionado: ${item.name}`, {
    id: item.id,
    price: item.price,
    isHardware: item.isHardware,
    type: item.type
  });

  // Verifica se o item tem ID válido
  if (!item.id) {
    console.warn(`Item ${item.name} não tem ID válido`);
    return false;
  }

  // Verifica se o preço é válido
  if (item.price === undefined || item.price < 0) {
    console.warn(`Item ${item.name} não tem preço válido: ${item.price}`);
    return false;
  }

  // Se for uma categoria de hardware, verifica se tem a flag isHardware
  const hardwareTypes = ["processador", "memoria", "memória", "armazenamento", "disco", "rede", "chassi", "hardware"];
  const isHardwareCategory = hardwareTypes.some(hwType => item.type.toLowerCase().includes(hwType));
  
  if (isHardwareCategory && item.isHardware !== true) {
    console.warn(`Item ${item.name} é de categoria hardware mas não tem flag isHardware: ${item.isHardware}`);
    return false;
  }

  return true;
};
