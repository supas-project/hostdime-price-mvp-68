
import { PriceData, PriceCategory, PriceItem } from "@/types/pricing";
import { serverData } from "@/data/server-components";

// Chave para armazenamento local
const PRICE_DATA_KEY = 'priceData';

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

// Carrega dados do localStorage ou usa dados iniciais
const loadDataFromStorage = (): PriceData => {
  try {
    const storedData = localStorage.getItem(PRICE_DATA_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Erro ao carregar dados da tabela de preços:', error);
  }
  
  // Salva dados iniciais no localStorage se não existirem
  localStorage.setItem(PRICE_DATA_KEY, JSON.stringify(initialPriceData));
  return initialPriceData;
};

// Salva dados no localStorage e notifica observadores
const saveDataToStorage = (data: PriceData): void => {
  try {
    localStorage.setItem(PRICE_DATA_KEY, JSON.stringify(data));
    notifyDataChangeListeners(data);
  } catch (error) {
    console.error('Erro ao salvar dados da tabela de preços:', error);
  }
};

// Notifica observadores sobre mudanças nos dados
const notifyDataChangeListeners = (data: PriceData): void => {
  dataChangeListeners.forEach(listener => {
    try {
      listener(data);
    } catch (error) {
      console.error('Erro ao notificar listener sobre mudança de dados:', error);
    }
  });
};

// Gera um ID único
const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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
    const data = loadDataFromStorage();
    return data[categoryId] || null;
  },
  
  // Adiciona uma nova categoria
  addCategory: (category: Omit<PriceCategory, 'id'>): PriceCategory => {
    const data = loadDataFromStorage();
    const id = category.name.toLowerCase().replace(/\s+/g, '-');
    
    // Verifica se a categoria já existe
    if (data[id]) {
      throw new Error(`Categoria com ID ${id} já existe`);
    }
    
    const newCategory: PriceCategory = {
      id,
      name: category.name,
      items: [],
    };
    
    data[id] = newCategory;
    saveDataToStorage(data);
    return newCategory;
  },
  
  // Atualiza uma categoria
  updateCategory: (categoryId: string, updates: Partial<PriceCategory>): PriceCategory => {
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Categoria com ID ${categoryId} não encontrada`);
    }
    
    data[categoryId] = {
      ...data[categoryId],
      ...updates,
    };
    
    saveDataToStorage(data);
    return data[categoryId];
  },
  
  // Remove uma categoria
  deleteCategory: (categoryId: string): void => {
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Categoria com ID ${categoryId} não encontrada`);
    }
    
    delete data[categoryId];
    saveDataToStorage(data);
  },
  
  // Adiciona um item a uma categoria
  addItem: (categoryId: string, item: Omit<PriceItem, 'id'>): PriceItem => {
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Categoria com ID ${categoryId} não encontrada`);
    }
    
    // Verifica se já existe um item com o mesmo nome
    const existingItem = data[categoryId].items.find(i => 
      i.name.toLowerCase() === item.name?.toLowerCase()
    );
    
    if (existingItem) {
      throw new Error(`Já existe um item com o nome "${item.name}" nesta categoria`);
    }
    
    const newItem: PriceItem = {
      id: generateUniqueId(),
      ...item,
    };
    
    data[categoryId].items.push(newItem);
    saveDataToStorage(data);
    return newItem;
  },
  
  // Atualiza um item
  updateItem: (categoryId: string, itemId: string, updates: Partial<PriceItem>): PriceItem => {
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Categoria com ID ${categoryId} não encontrada`);
    }
    
    const itemIndex = data[categoryId].items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error(`Item com ID ${itemId} não encontrado na categoria ${categoryId}`);
    }
    
    // Verificar se estamos alterando o nome para um nome já existente
    if (updates.name) {
      const duplicateName = data[categoryId].items.find(i => 
        i.name.toLowerCase() === updates.name?.toLowerCase() && i.id !== itemId
      );
      
      if (duplicateName) {
        throw new Error(`Já existe um item com o nome "${updates.name}" nesta categoria`);
      }
    }
    
    data[categoryId].items[itemIndex] = {
      ...data[categoryId].items[itemIndex],
      ...updates,
    };
    
    saveDataToStorage(data);
    return data[categoryId].items[itemIndex];
  },
  
  // Remove um item
  deleteItem: (categoryId: string, itemId: string): void => {
    const data = loadDataFromStorage();
    
    if (!data[categoryId]) {
      throw new Error(`Categoria com ID ${categoryId} não encontrada`);
    }
    
    const itemIndex = data[categoryId].items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error(`Item com ID ${itemId} não encontrado na categoria ${categoryId}`);
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
            name: item.name,
            description: item.description || '',
            price: typeof item.price === 'number' ? item.price : 0,
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
      throw error;
    }
  },
  
  // Analisa e importa dados CSV
  importFromCSV: (csvData: string): PriceData => {
    try {
      const lines = csvData.split('\n');
      
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
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Ignora linhas vazias
        
        const values = lines[i].split(',').map(v => v.trim());
        
        const categoryId = values[categoryIndex].toLowerCase().replace(/\s+/g, '-');
        const name = values[nameIndex];
        const description = descriptionIndex !== -1 ? values[descriptionIndex] : '';
        const price = parseFloat(values[priceIndex]);
        
        if (isNaN(price)) {
          console.warn(`Ignorando linha ${i+1} devido a preço inválido: ${values[priceIndex]}`);
          continue;
        }
        
        // Cria a categoria se não existir
        if (!mergedData[categoryId]) {
          mergedData[categoryId] = {
            id: categoryId,
            name: values[categoryIndex], // Usa o nome original da categoria com capitalização apropriada
            items: [],
          };
        }
        
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
      
      saveDataToStorage(mergedData);
      return mergedData;
    } catch (error) {
      console.error('Erro ao importar dados CSV:', error);
      throw error;
    }
  },
  
  // Reinicia dados para o estado inicial
  resetData: (): PriceData => {
    saveDataToStorage(initialPriceData);
    return initialPriceData;
  },
  
  // Inicialização do serviço
  initialize: () => {
    // Verificar se existem dados armazenados
    try {
      const storedData = localStorage.getItem(PRICE_DATA_KEY);
      if (!storedData) {
        console.log('Inicializando dados da tabela de preços...');
        saveDataToStorage(initialPriceData);
      }
    } catch (error) {
      console.error('Erro ao inicializar serviço de preços:', error);
    }
  }
};

// Inicializa serviço quando o arquivo é importado
PriceService.initialize();
