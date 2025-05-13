
/**
 * Utilitários para auxiliar no diagnóstico e correção de problemas de renderização
 */

/**
 * Mede o tempo de uma operação e registra no console
 * @param name Nome da operação para identificação
 * @param fn Função a ser executada e medida
 * @returns O resultado da função executada
 */
export function measure<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * Registra uma operação no console com um ID único para rastreamento
 * @param operation Nome da operação
 * @param details Detalhes adicionais a serem registrados
 */
export function logOperation(operation: string, details?: any): void {
  const id = Math.random().toString(36).substring(2, 8);
  console.log(`[Debug ${id}] ${operation}`, details || '');
}

/**
 * Verifica se um objeto está sendo renderizado corretamente e se seus valores são válidos
 * @param obj Objeto a ser verificado
 * @param name Nome para identificação no log
 */
export function validateObject(obj: any, name: string): boolean {
  if (!obj) {
    console.error(`[Validation] ${name} is null or undefined`);
    return false;
  }

  if (typeof obj !== 'object') {
    console.error(`[Validation] ${name} is not an object, got ${typeof obj}`);
    return false;
  }

  // Verifica se há propriedades circulares que podem causar problemas
  try {
    JSON.stringify(obj);
  } catch (err) {
    console.error(`[Validation] ${name} cannot be serialized (circular reference?)`, err);
    return false;
  }

  return true;
}

/**
 * Adiciona um interceptador de erros não tratados
 * @param errorHandler Função de tratamento de erros
 */
export function setupErrorInterceptor(
  errorHandler: (error: Error, info: { componentStack: string }) => void
): void {
  window.addEventListener('error', (event) => {
    console.error('[Global Error]', event.error);
    errorHandler(event.error, { componentStack: event.error.stack || '' });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);
    errorHandler(
      new Error(`Unhandled promise rejection: ${event.reason}`),
      { componentStack: '' }
    );
  });
}
