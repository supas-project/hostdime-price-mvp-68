import { PriceData, PriceCategory, PriceItem } from "@/types/pricing";
import { serverData } from "@/data/server-components";
import { toast } from "@/utils/toast-utils";

// Chave para armazenamento local
const PRICE_DATA_KEY = 'priceData';

// Flag para controlar operações concorrentes de gravação
let isWriteLocked = false;

// Timestamp da última atualização para controle de versão
let lastUpdateTimestamp = Date.now();

// Dados iniciais carregados dos componentes do servidor
const initialPriceData: PriceData = {
  cpu: { 
    id: 'cpu', 
    name: 'Processadores', 
    items: serverData.componentes.find(c => c.type === "Processador")?.options?.map(option => ({
      id: option.id,
      name: option.name,
      description: option.description,
      price: option.price,
      specs: option.specs || [],
      type: option.type,
      subtype: option.subtype,
      metadata: option.metadata,
    })) || []
  },
  memory: { 
    id: 'memory', 
    name: 'Memória', 
    items: serverData.componentes.find(c => c.type === "Memória")?.options?.map(option => ({
      id: option.id,
      name: option.name,
      description: option.description,
      price: option.price,
      specs: option.specs || [],
      type: option.type,
      subtype: option.subtype,
      metadata: option.metadata,
    })) || []
  },
  disk: { id: 'disk', name: 'Discos', items: [] },
  storage: { id: 'storage', name: 'Storage', items: [] },
  network: { id: 'network', name: 'Interface de Rede', items: [] },
  ip: { id: 'ip', name: 'Bloco de IPs', items: [] },
  os: { id: 'os', name: 'Sistemas Operacionais', items: [] },
  chassis: { id: 'chassis', name: 'Chassi', items: [] },
  contract: { id: 'contract', name: 'Contratos', items: [] },
  connectivity: { id: 'connectivity', name: 'Conectividade', items: [] }
};

// Tipo para listeners (observadores)
type DataChangeListener = (data: PriceData) => void;
let dataChangeListeners: DataChangeListener[] = [];

// Sistema de controle de versão para detecção de conflitos
interface VersionedData {
  data: PriceData;
  version: number;
}

// Controle de sessão para diagnóstico multiusuário
const SESSION_ID = `user_${Math.random().toString(36).substring(2, 10)}`;
const sessionStartTime = Date.now();

// Carrega dados do localStorage ou usa dados iniciais
const loadDataFromStorage = (): PriceData => {
  try {
    const storedData = localStorage.getItem(PRICE_DATA_KEY);
    if (storedData) {
      try {
        // Tenta fazer parse dos dados, que podem incluir controle de versão
        const parsedData = JSON.parse(storedData);
        
        // Verifica se os dados têm o formato versionado
        if (parsedData && parsedData.version && parsedData.data) {
          // Atualiza o timestamp de última atualização
          lastUpdateTimestamp = parsedData.version;
          return parsedData.data;
        }
        
        // Compatibilidade com dados antigos (sem versão)
        return parsedData;
      } catch (parseError) {
        console.error('Erro ao fazer parse dos dados:', parseError);
        // Registra erro de sessão para diagnóstico
        logSessionEvent('error', 'parse_data_error', { error: String(parseError) });
        
        toast.error("Erro ao processar dados armazenados");
        return initialPriceData;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar dados da tabela de preços:', error);
    // Notificar o usuário sobre o erro de carregamento
    toast.error("Não foi possível carregar os dados salvos. Usando dados padrão.");
    
    // Registra erro de sessão para diagnóstico
    logSessionEvent('error', 'load_data_error', { error: String(error) });
  }
  
  // Salva dados iniciais no localStorage se não existirem
  const versionedData: VersionedData = {
    data: initialPriceData,
    version: Date.now()
  };
  
  localStorage.setItem(PRICE_DATA_KEY, JSON.stringify(versionedData));
  return initialPriceData;
};

// Salva dados no localStorage e notifica observadores
const saveDataToStorage = (data: PriceData): void => {
  try {
    // Verificar se há uma gravação em andamento
    if (isWriteLocked) {
      console.warn('Tentativa de gravação durante operação de gravação em andamento');
      throw new Error("Operação em andamento. Tente novamente.");
    }
    
    // Adquire o lock
    isWriteLocked = true;
    
    // Verifica se há atualizações concorrentes
    const currentData = localStorage.getItem(PRICE_DATA_KEY);
    if (currentData) {
      try {
        const parsedData = JSON.parse(currentData);
        if (parsedData && parsedData.version && parsedData.version > lastUpdateTimestamp) {
          // Detectou atualização concorrente
          console.warn("Conflito de dados detectado: outro usuário modificou os dados");
          logSessionEvent('warn', 'concurrent_update_detected', {
            localTimestamp: lastUpdateTimestamp,
            remoteTimestamp: parsedData.version
          });
          
          toast.warning("Alterações feitas por outro usuário detectadas. Atualizando dados.");
          
          // Atualiza localmente com os dados mais recentes
          lastUpdateTimestamp = parsedData.version;
          isWriteLocked = false;
          
          // Notifica sobre dados atualizados, mas não salva os dados atuais (evita sobreposição)
          notifyDataChangeListeners(parsedData.data);
          
          throw new Error("Dados modificados por outro usuário. Por favor, tente novamente após atualização.");
        }
      } catch (parseError) {
        // Erro ao analisar dados existentes, continua com a gravação
        console.warn('Erro ao verificar versão de dados existentes:', parseError);
      }
    }
    
    // Atualiza a versão para esta gravação
    const newTimestamp = Date.now();
    lastUpdateTimestamp = newTimestamp;
    
    // Prepara dados versionados
    const versionedData: VersionedData = {
      data,
      version: newTimestamp
    };
    
    // Salva no localStorage
    localStorage.setItem(PRICE_DATA_KEY, JSON.stringify(versionedData));
    
    // Registra evento de atualização
    logSessionEvent('info', 'data_updated', { timestamp: newTimestamp });
    
    notifyDataChangeListeners(data);
  } catch (error) {
    console.error('Erro ao salvar dados da tabela de preços:', error);
    toast.error("Não foi possível salvar os dados. Verifique o espaço disponível no navegador.");
    
    // Registra erro para diagnóstico
    logSessionEvent('error', 'save_data_error', { error: String(error) });
    
    throw new Error("Falha ao salvar dados no armazenamento local");
  } finally {
    // Libera o lock sempre, mesmo em caso de erro
    isWriteLocked = false;
  }
};

// Log de eventos de sessão para diagnóstico multiusuário
type LogLevel = 'info' | 'warn' | 'error';
interface SessionEvent {
  sessionId: string;
  timestamp: number;
  level: LogLevel;
  event: string;
  details?: any;
}

// Armazenamento de eventos de sessão para diagnóstico
const SESSION_EVENTS_KEY = 'session_events';
const MAX_SESSION_EVENTS = 100;

// Função para registrar eventos de sessão
const logSessionEvent = (level: LogLevel, event: string, details?: any) => {
  try {
    // Criar novo evento de sessão
    const newEvent: SessionEvent = {
      sessionId: SESSION_ID,
      timestamp: Date.now(),
      level,
      event,
      details
    };
    
    // Recuperar eventos existentes ou inicializar array vazio
    let events: SessionEvent[] = [];
    const storedEvents = localStorage.getItem(SESSION_EVENTS_KEY);
    
    if (storedEvents) {
      try {
        events = JSON.parse(storedEvents);
      } catch (e) {
        console.warn('Erro ao processar eventos de sessão armazenados');
        events = [];
      }
    }
    
    // Adicionar novo evento e limitar o tamanho do histórico
    events.push(newEvent);
    if (events.length > MAX_SESSION_EVENTS) {
      events = events.slice(-MAX_SESSION_EVENTS); // Manter apenas os mais recentes
    }
    
    // Salvar eventos atualizados
    localStorage.setItem(SESSION_EVENTS_KEY, JSON.stringify(events));
  } catch (e) {
    // Falha silenciosa em caso de erro no log (não deve interromper a operação principal)
    console.warn('Falha ao registrar evento de sessão:', e);
  }
};

// Notifica observadores sobre mudanças nos dados
const notifyDataChangeListeners = (data: PriceData): void => {
  dataChangeListeners.forEach(listener => {
    try {
      listener(data);
    } catch (error) {
      console.error('Erro ao notificar listener sobre mudança de dados:', error);
      logSessionEvent('error', 'listener_notification_error', { error: String(error) });
    }
  });
};

// Gera um ID único
const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Validação de item
const validateItem = (item: Partial<PriceItem>): string | null => {
  if (!item.name || item.name.trim() === '') {
    return "Nome do item é obrigatório";
  }
  
  if (item.price === undefined || item.price < 0) {
    return "Preço deve ser um número positivo";
  }
  
  if (!item.type || item.type.trim() === '') {
    return "Tipo do item é obrigatório";
  }
  
  return null; // Item válido
};

// Funções para manipular dados de preços
export const PriceService = {
  // Adiciona um listener para mudanças de dados
  addDataChangeListener: (listener: DataChangeListener): void => {
    dataChangeListeners.push(listener);
  },
  
  // Remove um listener
  removeDataChangeListener: (listener: DataChangeListener): void => {
    dataChangeListeners = dataChangeListeners.filter(l => l !== listener);
  },
  
  // Obtém todos os dados
  getAllData: (): PriceData => {
    return loadDataFromStorage();
  },
  
  // Obtém uma categoria específica
  getCategory: (categoryId: string): PriceCategory | null => {
    if (!categoryId) {
      console.error('ID de categoria inválido ou não fornecido');
      return null;
    }
    
    const data = loadDataFromStorage();
    return data[categoryId] || null;
  },
  
  // Adiciona uma nova categoria
  addCategory: (category: Omit<PriceCategory, 'id'>): PriceCategory => {
    if (!category.name || category.name.trim() === '') {
      throw new Error("Nome da categoria é obrigatório");
    }
    
    const data = loadDataFromStorage();
    const id = category.name.toLowerCase().replace(/\s+/g, '-');
    
    // Verifica se a categoria já existe
    if (data[id]) {
      throw new Error(`Categoria "${category.name}" já existe`);
    }
    
    const newCategory: PriceCategory = {
      id,
      name: category.name.trim(),
      items: [],
    };
    
    data[id] = newCategory;
    saveDataToStorage(data);
    return newCategory;
  },
  
  // Atualiza uma categoria
  updateCategory: (categoryId: string, updates: Partial<PriceCategory>): PriceCategory => {
    if (!categoryId) {
      throw new Error("ID de categoria não fornecido");
    }
    
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Categoria com ID "${categoryId}" não encontrada`);
    }
    
    if (updates.name && updates.name.trim() === '') {
      throw new Error("Nome da categoria não pode ser vazio");
    }
    
    data[categoryId] = {
      ...data[categoryId],
      ...updates,
      // Garantir que o ID não seja alterado
      id: categoryId
    };
    
    saveDataToStorage(data);
    return data[categoryId];
  },
  
  // Remove uma categoria
  deleteCategory: (categoryId: string): void => {
    if (!categoryId) {
      throw new Error("ID de categoria não fornecido");
    }
    
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Categoria com ID "${categoryId}" não encontrada`);
    }
    
    delete data[categoryId];
    saveDataToStorage(data);
  },
  
  // Adiciona um item a uma categoria
  addItem: (categoryId: string, item: Omit<PriceItem, 'id'>): PriceItem => {
    if (!categoryId) {
      throw new Error("ID de categoria não fornecido");
    }
    
    const validationError = validateItem(item);
    if (validationError) {
      throw new Error(validationError);
    }
    
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Categoria com ID "${categoryId}" não encontrada`);
    }
    
    // Normaliza o nome para uma verificação mais robusta de duplicidade
    const normalizedItemName = item.name.trim().toLowerCase();
    
    // Verifica se já existe um item com o mesmo nome (normalizado)
    const existingItem = data[categoryId].items.find(i => 
      i.name.toLowerCase().trim() === normalizedItemName
    );
    
    if (existingItem) {
      throw new Error(`Já existe um item com o nome "${item.name}" nesta categoria`);
    }
    
    const newItem: PriceItem = {
      id: generateUniqueId(),
      ...item,
      name: item.name.trim(),
      description: item.description?.trim() || '',
      specs: item.specs || [],
      price: Number(item.price) // Garantir que o preço seja um número
    };
    
    // Cria uma nova cópia dos dados para garantir atomicidade
    const updatedData = {
      ...data,
      [categoryId]: {
        ...data[categoryId],
        items: [...data[categoryId].items, newItem]
      }
    };
    
    // Salva os dados atualizados
    saveDataToStorage(updatedData);
    return newItem;
  },
  
  // Atualiza um item
  updateItem: (categoryId: string, itemId: string, updates: Partial<PriceItem>): PriceItem => {
    if (!categoryId || !itemId) {
      throw new Error("ID de categoria ou ID de item não fornecido");
    }
    
    // Validar campos atualizados
    if (updates.price !== undefined && (isNaN(Number(updates.price)) || Number(updates.price) < 0)) {
      throw new Error("Preço deve ser um número positivo");
    }
    
    if (updates.name !== undefined && updates.name.trim() === '') {
      throw new Error("Nome do item não pode ser vazio");
    }
    
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Categoria com ID "${categoryId}" não encontrada`);
    }
    
    const itemIndex = data[categoryId].items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error(`Item com ID "${itemId}" não encontrado na categoria ${categoryId}`);
    }
    
    // Verificar se estamos alterando o nome para um nome já existente
    if (updates.name) {
      const duplicateName = data[categoryId].items.find(i => 
        i.name.toLowerCase() === updates.name?.toLowerCase() && i.id !== itemId
      );
      
      if (duplicateName) {
        throw new Error(`Não é possível renomear para "${updates.name}" pois já existe um item com este nome nesta categoria`);
      }
    }
    
    // Atualizar o item com os novos valores
    data[categoryId].items[itemIndex] = {
      ...data[categoryId].items[itemIndex],
      ...updates,
      // Garantir que o ID não seja alterado
      id: itemId,
      // Processar campos de texto para remover espaços extras
      name: updates.name !== undefined ? updates.name.trim() : data[categoryId].items[itemIndex].name,
      description: updates.description !== undefined ? 
        updates.description.trim() : data[categoryId].items[itemIndex].description,
      // Garantir que o preço seja um número
      price: updates.price !== undefined ? Number(updates.price) : data[categoryId].items[itemIndex].price
    };
    
    saveDataToStorage(data);
    return data[categoryId].items[itemIndex];
  },
  
  // Remove um item
  deleteItem: (categoryId: string, itemId: string): void => {
    if (!categoryId || !itemId) {
      throw new Error("ID de categoria ou ID de item não fornecido");
    }
    
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Categoria com ID "${categoryId}" não encontrada`);
    }
    
    const itemIndex = data[categoryId].items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error(`Item com ID "${itemId}" não encontrado na categoria ${categoryId}`);
    }
    
    data[categoryId].items.splice(itemIndex, 1);
    saveDataToStorage(data);
  },
  
  // Importa dados de JSON
  importFromJSON: (jsonData: string): PriceData => {
    try {
      const parsedData = JSON.parse(jsonData);
      
      // Valida a estrutura
      if (typeof parsedData !== 'object' || parsedData === null) {
        throw new Error('Estrutura JSON inválida. Esperado um objeto.');
      }
      
      // Mescla com dados existentes
      const existingData = loadDataFromStorage();
      const mergedData = { ...existingData };
      
      Object.entries(parsedData).forEach(([categoryId, category]) => {
        // Valida a estrutura da categoria
        if (typeof category !== 'object' || !('items' in category) || !Array.isArray(category.items)) {
          throw new Error(`Estrutura de categoria inválida para ${categoryId}`);
        }
        
        // Cria ou atualiza a categoria
        mergedData[categoryId] = {
          id: categoryId,
          name: (category as PriceCategory).name || categoryId,
          items: (category as PriceCategory).items.map(item => ({
            id: item.id || generateUniqueId(),
            name: item.name?.trim() || 'Item sem nome',
            description: item.description?.trim() || '',
            price: typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0,
            specs: Array.isArray(item.specs) ? item.specs : [],
            type: item.type || categoryId,
            subtype: item.subtype,
            metadata: item.metadata || {},
          })),
        };
      });
      
      saveDataToStorage(mergedData);
      return mergedData;
    } catch (error) {
      console.error('Erro ao importar dados JSON:', error);
      toast.error(error instanceof Error ? error.message : "Formato JSON inválido");
      throw error;
    }
  },
  
  // Analisa e importa dados CSV
  importFromCSV: (csvData: string): PriceData => {
    try {
      const lines = csvData.split('\n');
      
      if (lines.length < 2) {
        throw new Error("Arquivo CSV inválido ou vazio");
      }
      
      // Extrai o cabeçalho
      const header = lines[0].split(',').map(h => h.trim());
      
      // Verifica colunas obrigatórias
      const categoryIndex = header.findIndex(h => h.toLowerCase() === 'category');
      const nameIndex = header.findIndex(h => h.toLowerCase() === 'name');
      const descriptionIndex = header.findIndex(h => h.toLowerCase() === 'description');
      const priceIndex = header.findIndex(h => h.toLowerCase() === 'price');
      
      if (categoryIndex === -1 || nameIndex === -1 || priceIndex === -1) {
        throw new Error('O CSV deve conter pelo menos as colunas category, name e price');
      }
      
      // Processa linhas de dados
      const existingData = loadDataFromStorage();
      const mergedData: PriceData = { ...existingData };
      let importedItems = 0;
      let invalidItems = 0;
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Ignora linhas vazias
        
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length < Math.max(categoryIndex, nameIndex, priceIndex) + 1) {
          invalidItems++;
          continue; // Linha não tem todas as colunas necessárias
        }
        
        const categoryName = values[categoryIndex];
        if (!categoryName) {
          invalidItems++;
          continue; // Categoria vazia
        }
        
        const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
        const name = values[nameIndex];
        if (!name) {
          invalidItems++;
          continue; // Nome vazio
        }
        
        const description = descriptionIndex !== -1 ? values[descriptionIndex] : '';
        const price = parseFloat(values[priceIndex]);
        
        if (isNaN(price)) {
          invalidItems++;
          continue; // Preço inválido
        }
        
        // Cria a categoria se não existir
        if (!mergedData[categoryId]) {
          mergedData[categoryId] = {
            id: categoryId,
            name: categoryName, // Usa o nome original da categoria com capitalização apropriada
            items: [],
          };
        }
        
        // Verifica se já existe um item com o mesmo nome
        const existingItem = mergedData[categoryId].items.find(
          item => item.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingItem) {
          // Atualiza item existente
          existingItem.description = description;
          existingItem.price = price;
        } else {
          // Adiciona o item à categoria
          mergedData[categoryId].items.push({
            id: generateUniqueId(),
            name,
            description,
            price,
            specs: [],
            type: categoryId,
          });
        }
        
        importedItems++;
      }
      
      saveDataToStorage(mergedData);
      
      if (invalidItems > 0) {
        toast.info(`Importados ${importedItems} itens. ${invalidItems} itens foram ignorados por terem formato inválido.`);
      }
      
      return mergedData;
    } catch (error) {
      console.error('Erro ao importar dados CSV:', error);
      toast.error(error instanceof Error ? error.message : "Formato CSV inválido");
      throw error;
    }
  },
  
  // Reinicia dados para o estado inicial
  resetData: (): PriceData => {
    saveDataToStorage(initialPriceData);
    return initialPriceData;
  },
  
  // Nova funcionalidade: obter informações de diagnóstico multiusuário
  getDiagnosticInfo: () => {
    try {
      // Recuperar eventos de sessão
      const storedEvents = localStorage.getItem(SESSION_EVENTS_KEY) || '[]';
      const events = JSON.parse(storedEvents) as SessionEvent[];
      
      return {
        sessionId: SESSION_ID,
        sessionStartTime,
        sessionDuration: Date.now() - sessionStartTime,
        lastUpdateTimestamp,
        isWriteLocked,
        activeListeners: dataChangeListeners.length,
        recentEvents: events.slice(-20) // Retornar apenas os 20 eventos mais recentes
      };
    } catch (e) {
      console.error('Erro ao obter informações de diagnóstico:', e);
      return {
        sessionId: SESSION_ID,
        error: 'Falha ao obter informações de diagnóstico'
      };
    }
  },
  
  // Nova funcionalidade: verificar se há conflitos de dados com outras sessões
  checkForDataConflicts: () => {
    try {
      const storedData = localStorage.getItem(PRICE_DATA_KEY);
      if (!storedData) return false;
      
      const parsedData = JSON.parse(storedData);
      if (parsedData && parsedData.version && parsedData.version > lastUpdateTimestamp) {
        // Conflito detectado: dados mais recentes disponíveis
        logSessionEvent('info', 'conflict_check_detected_newer_data', { 
          localTimestamp: lastUpdateTimestamp,
          remoteTimestamp: parsedData.version 
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Erro ao verificar conflitos de dados:', e);
      logSessionEvent('error', 'conflict_check_error', { error: String(e) });
      return false;
    }
  },
  
  // Nova funcionalidade: forçar atualização de dados da fonte mais recente
  forceRefreshFromLatestSource: (): PriceData => {
    logSessionEvent('info', 'manual_refresh_requested');
    const data = loadDataFromStorage();
    notifyDataChangeListeners(data);
    return data;
  },
  
  // Inicialização do serviço
  initialize: () => {
    // Registrar início de sessão
    logSessionEvent('info', 'session_started', {
      userAgent: navigator.userAgent,
      timestamp: sessionStartTime
    });
    
    // Verificar se existem dados armazenados
    try {
      const storedData = localStorage.getItem(PRICE_DATA_KEY);
      if (!storedData) {
        console.log('Inicializando dados da tabela de preços...');
        saveDataToStorage(initialPriceData);
      } else {
        // Verifica a versão dos dados existentes
        try {
          const parsedData = JSON.parse(storedData);
          if (parsedData && parsedData.version) {
            lastUpdateTimestamp = parsedData.version;
            logSessionEvent('info', 'loaded_versioned_data', { version: parsedData.version });
          } else {
            // Dados antigos sem versão - atualizar para o novo formato
            const versionedData: VersionedData = {
              data: parsedData,
              version: Date.now()
            };
            localStorage.setItem(PRICE_DATA_KEY, JSON.stringify(versionedData));
            logSessionEvent('info', 'migrated_to_versioned_data');
          }
        } catch (e) {
          console.warn('Erro ao verificar versão dos dados:', e);
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar serviço de preços:', error);
      toast.error("Não foi possível inicializar o serviço de preços.");
      
      logSessionEvent('error', 'initialization_error', { error: String(error) });
    }
  }
};

// Inicializa serviço quando o arquivo é importado
PriceService.initialize();
