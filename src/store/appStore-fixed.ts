import { create } from 'zustand';
import { toast } from 'sonner';
// import { buildApiUrl, API_CONFIG } from '../config/api'; // Disabled for now

interface PriceItem {
  id: number;
  category: string;
  name: string;
  price: number;
  description?: string;
  specifications?: string[];
}

interface SelectedComponent {
  category: string;
  component: PriceItem;
  quantity: number;
}

interface AppState {
  // Estado dos dados
  items: PriceItem[];
  categories: string[];
  selectedComponents: SelectedComponent[];
  status: 'idle' | 'loading' | 'success' | 'error';
  
  // Estado de autenticação
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string; isAdmin: boolean } | null;
  token: string | null;
  
  // Ações
  fetchInitialData: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  selectComponent: (category: string, component: PriceItem, quantity?: number) => void;
  removeComponent: (category: string, componentId: number) => void;
  updateComponentQuantity: (category: string, componentId: number, quantity: number) => void;
  clearSelection: () => void;
  getComponentsByCategory: (category: string) => PriceItem[];
  getTotalPrice: () => number;
  getSelectedComponentsCount: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Estado inicial
  items: [],
  categories: [],
  selectedComponents: [],
  status: 'idle',
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('auth_token'),

  // Buscar dados iniciais
  fetchInitialData: async () => {
    try {
      set({ status: 'loading' });
      
      console.log('🔄 Carregando dados da API...');
      
      // Carregar categorias
      const categoriesResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.DATA.CATEGORIES));
      const categoriesData = await categoriesResponse.json();
      
      if (!categoriesData.success) {
        throw new Error(categoriesData.error || 'Erro ao carregar categorias');
      }
      
      const categories = categoriesData.data.map((cat: any) => cat.display_name);
      
      // Carregar todos os itens
      const allItems: PriceItem[] = [];
      
      for (const category of categoriesData.data) {
        try {
          const itemsUrl = buildApiUrl(API_CONFIG.ENDPOINTS.DATA.ITEMS, { categoryId: category.id });
          const itemsResponse = await fetch(itemsUrl);
          const itemsData = await itemsResponse.json();
          
          if (itemsData.success && itemsData.data) {
            const categoryItems = itemsData.data.map((item: any) => ({
              id: item.id,
              category: category.display_name,
              name: item.name,
              price: item.price,
              description: item.description,
              specifications: item.specifications || []
            }));
            
            allItems.push(...categoryItems);
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao carregar itens da categoria ${category.display_name}:`, error);
        }
      }
      
      set({
        items: allItems,
        categories,
        status: 'success'
      });
      
      console.log(`✅ Dados carregados: ${allItems.length} itens em ${categories.length} categorias`);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      set({ status: 'error' });
      toast.error('Erro ao carregar dados', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  // Login do usuário
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        set({
          isAuthenticated: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.full_name || data.user.name,
            isAdmin: data.user.role === 'admin'
          },
          token: data.token
        });

        localStorage.setItem('auth_token', data.token);
        toast.success('Login realizado com sucesso!');
        return true;
      } else {
        toast.error(data.error || 'Erro no login');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      toast.error('Erro de conexão');
      return false;
    }
  },

  // Logout do usuário
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      token: null
    });
    localStorage.removeItem('auth_token');
    toast.success('Logout realizado com sucesso!');
  },

  // Selecionar componente
  selectComponent: (category: string, component: PriceItem, quantity = 1) => {
    const { selectedComponents } = get();
    
    // Verificar se já existe um componente da mesma categoria
    const existingIndex = selectedComponents.findIndex(
      item => item.category === category
    );

    let newSelection;
    if (existingIndex >= 0) {
      // Substituir componente existente da categoria
      newSelection = [...selectedComponents];
      newSelection[existingIndex] = { category, component, quantity };
      toast.success(`${component.name} substituído em ${category}`);
    } else {
      // Adicionar novo componente
      newSelection = [...selectedComponents, { category, component, quantity }];
      toast.success(`${component.name} adicionado à configuração`);
    }

    set({ selectedComponents: newSelection });
  },

  // Remover componente
  removeComponent: (category: string, componentId: number) => {
    const { selectedComponents } = get();
    const newSelection = selectedComponents.filter(
      item => !(item.category === category && item.component.id === componentId)
    );
    
    set({ selectedComponents: newSelection });
    toast.success('Componente removido da configuração');
  },

  // Atualizar quantidade
  updateComponentQuantity: (category: string, componentId: number, quantity: number) => {
    if (quantity <= 0) return;
    
    const { selectedComponents } = get();
    const newSelection = selectedComponents.map(item => {
      if (item.category === category && item.component.id === componentId) {
        return { ...item, quantity };
      }
      return item;
    });
    
    set({ selectedComponents: newSelection });
  },

  // Limpar seleção
  clearSelection: () => {
    set({ selectedComponents: [] });
    toast.success('Configuração limpa');
  },

  // Obter componentes por categoria
  getComponentsByCategory: (category: string) => {
    const { items } = get();
    return items.filter(item => item.category === category);
  },

  // Calcular preço total
  getTotalPrice: () => {
    const { selectedComponents } = get();
    return selectedComponents.reduce(
      (total, item) => total + (item.component.price * item.quantity),
      0
    );
  },

  // Contar componentes selecionados
  getSelectedComponentsCount: () => {
    const { selectedComponents } = get();
    return selectedComponents.reduce((total, item) => total + item.quantity, 0);
  }
}));
