
import { PriceData, PriceCategory, PriceItem } from "@/types/pricing";
import { serverData } from "@/data/server-components";
import { toast } from "@/utils/toast-utils";
import { supabase } from "@/lib/supabase";

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
  getAllData: async (): Promise<PriceData> => {
    try {
      // Tentar carregar do Supabase
      const { data, error } = await supabase
        .from('price_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Erro ao carregar dados:', error);
        // Se houver erro, retorna dados iniciais
        return initialPriceData;
      }
      
      if (!data || !data.data) {
        // Se não existir dados, salva dados iniciais
        await PriceService.saveDataToSupabase(initialPriceData);
        return initialPriceData;
      }
      
      // Dados recuperados com sucesso
      return data.data as PriceData;
    } catch (error) {
      console.error('Erro ao obter dados:', error);
      return initialPriceData;
    }
  },
  
  // Salvar dados no Supabase
  saveDataToSupabase: async (data: PriceData): Promise<void> => {
    try {
      // Verificar se já existem dados
      const { data: existingData, error: checkError } = await supabase
        .from('price_data')
        .select('id')
        .limit(1)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar dados existentes:', checkError);
        throw new Error('Falha ao verificar dados existentes no banco');
      }
      
      if (existingData) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('price_data')
          .update({ 
            data: data,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
          
        if (error) {
          console.error('Erro ao atualizar dados:', error);
          throw new Error('Falha ao atualizar dados no banco');
        }
      } else {
        // Inserir novo registro
        const { error } = await supabase
          .from('price_data')
          .insert([{ 
            data: data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
          
        if (error) {
          console.error('Erro ao inserir dados:', error);
          throw new Error('Falha ao inserir dados no banco');
        }
      }
      
      // Registrar atualização
      await supabase
        .from('price_data_updates')
        .insert([{
          type: 'data_update',
          details: 'Dados de preços atualizados',
          updated_at: new Date().toISOString()
        }]);
        
      // Notificar observadores
      notifyDataChangeListeners(data);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      throw error;
    }
  },
  
  // Obtém uma categoria específica
  getCategory: async (categoryId: string): Promise<PriceCategory> => {
    if (!categoryId) {
      console.error('ID de categoria inválido ou não fornecido');
      return { id: '', name: '', items: [] };
    }
    
    const data = await PriceService.getAllData();
    return data[categoryId] || { id: categoryId, name: categoryId, items: [] };
  },
  
  // Adiciona uma nova categoria
  addCategory: async (category: Omit<PriceCategory, 'id'>): Promise<PriceCategory> => {
    if (!category.name || category.name.trim() === '') {
      throw new Error("Nome da categoria é obrigatório");
    }
    
    const data = await PriceService.getAllData();
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
    await PriceService.saveDataToSupabase(data);
    return newCategory;
  },
  
  // Atualiza uma categoria
  updateCategory: async (categoryId: string, updates: Partial<PriceCategory>): Promise<PriceCategory> => {
    if (!categoryId) {
      throw new Error("ID de categoria não fornecido");
    }
    
    const data = await PriceService.getAllData();
    
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
    
    await PriceService.saveDataToSupabase(data);
    return data[categoryId];
  },
  
  // Remove uma categoria
  deleteCategory: async (categoryId: string): Promise<void> => {
    if (!categoryId) {
      throw new Error("ID de categoria não fornecido");
    }
    
    const data = await PriceService.getAllData();
    
    if (!data[categoryId]) {
      throw new Error(`Categoria com ID "${categoryId}" não encontrada`);
    }
    
    delete data[categoryId];
    await PriceService.saveDataToSupabase(data);
  },
  
  // Adiciona um item a uma categoria
  addItem: async (categoryId: string, item: Omit<PriceItem, 'id'>): Promise<PriceItem> => {
    if (!categoryId) {
      throw new Error("ID de categoria não fornecido");
    }
    
    const validationError = validateItem(item);
    if (validationError) {
      throw new Error(validationError);
    }
    
    const data = await PriceService.getAllData();
    
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
    await PriceService.saveDataToSupabase(updatedData);
    return newItem;
  },
  
  // Atualiza um item
  updateItem: async (categoryId: string, itemId: string, updates: Partial<PriceItem>): Promise<PriceItem> => {
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
    
    const data = await PriceService.getAllData();
    
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
    
    await PriceService.saveDataToSupabase(data);
    return data[categoryId].items[itemIndex];
  },
  
  // Remove um item
  deleteItem: async (categoryId: string, itemId: string): Promise<void> => {
    if (!categoryId || !itemId) {
      throw new Error("ID de categoria ou ID de item não fornecido");
    }
    
    const data = await PriceService.getAllData();
    
    if (!data[categoryId]) {
      throw new Error(`Categoria com ID "${categoryId}" não encontrada`);
    }
    
    const itemIndex = data[categoryId].items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error(`Item com ID "${itemId}" não encontrado na categoria ${categoryId}`);
    }
    
    data[categoryId].items.splice(itemIndex, 1);
    await PriceService.saveDataToSupabase(data);
  },
  
  // Importa dados de JSON
  importFromJSON: async (jsonData: string): Promise<PriceData> => {
    try {
      const parsedData = JSON.parse(jsonData);
      
      // Valida a estrutura
      if (typeof parsedData !== 'object' || parsedData === null) {
        throw new Error('Estrutura JSON inválida. Esperado um objeto.');
      }
      
      // Mescla com dados existentes
      const existingData = await PriceService.getAllData();
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
      
      await PriceService.saveDataToSupabase(mergedData);
      return mergedData;
    } catch (error) {
      console.error('Erro ao importar dados JSON:', error);
      toast.error(error instanceof Error ? error.message : "Formato JSON inválido");
      throw error;
    }
  },
  
  // Analisa e importa dados CSV
  importFromCSV: async (csvData: string): Promise<PriceData> => {
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
      const existingData = await PriceService.getAllData();
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
      
      await PriceService.saveDataToSupabase(mergedData);
      
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
  resetData: async (): Promise<PriceData> => {
    await PriceService.saveDataToSupabase(initialPriceData);
    return initialPriceData;
  },
  
  // Verificar se há conflitos de dados com outras sessões
  checkForDataConflicts: async (): Promise<boolean> => {
    try {
      // Verifica se há atualizações mais recentes
      const { data, error } = await supabase
        .from('price_data_updates')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error || !data) {
        return false;
      }
      
      // Se houver dados e o usuário não tiver sincronizado ainda, há conflito
      return true;
    } catch (e) {
      console.error('Erro ao verificar conflitos de dados:', e);
      return false;
    }
  },
  
  // Forçar atualização de dados da fonte mais recente
  forceRefreshFromLatestSource: async (): Promise<PriceData> => {
    console.info('Forçando atualização de dados da fonte mais recente');
    const data = await PriceService.getAllData();
    notifyDataChangeListeners(data);
    return data;
  },
  
  // Inicialização do serviço
  initialize: async () => {
    try {
      // Verificar se as tabelas necessárias existem
      const { error } = await supabase
        .from('price_data')
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST204') {
        console.error('Tabela price_data não existe. Será necessário criá-la.');
      } else {
        console.log('Conexão com banco de dados estabelecida.');
      }
      
      // Carregar dados iniciais se necessário
      const data = await PriceService.getAllData();
      console.log('Dados carregados com sucesso.');
    } catch (error) {
      console.error('Erro ao inicializar serviço de preços:', error);
      toast.error("Não foi possível inicializar o serviço de preços.");
    }
  }
};

// Inicializa serviço quando o arquivo é importado
PriceService.initialize();
