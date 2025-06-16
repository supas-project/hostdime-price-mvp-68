import { create } from 'zustand';
import { toast } from 'sonner';
import { buildApiUrl, API_CONFIG } from '../config/api';

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
  
  // Ações assíncronas
  fetchInitialData: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Ações de seleção
  selectComponent: (category: string, component: PriceItem, quantity?: number) => void;
  removeComponent: (category: string, componentId: number) => void;
  updateComponentQuantity: (category: string, componentId: number, quantity: number) => void;
  clearSelection: () => void;
  
  // Ações utilitárias
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
      
      const response = await fetch(`${API_BASE_URL}/prices`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const items = data.data;
        const categories = [...new Set(items.map((item: PriceItem) => item.category))].sort();
        
        set({
          items,
          categories,
          status: 'success'
        });
        
        console.log(`✅ Dados carregados: ${items.length} itens em ${categories.length} categorias`);
      } else {
        throw new Error(data.error || 'Erro ao carregar dados');
      }
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
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        const token = data.token;
        const user = data.user;
        
        // Salvar token no localStorage
        localStorage.setItem('auth_token', token);
        
        set({
          isAuthenticated: true,
          user,
          token
        });

        toast.success('Login realizado com sucesso', {
          description: `Bem-vindo, ${user.name || user.email}!`
        });

        return true;
      } else {
        toast.error('Erro no login', {
          description: data.error || 'Credenciais inválidas'
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      toast.error('Erro de conexão', {
        description: 'Não foi possível conectar ao servidor'
      });
      return false;
    }
  },

  // Logout do usuário
  logout: () => {
    localStorage.removeItem('auth_token');
    set({
      isAuthenticated: false,
      user: null,
      token: null
    });
    toast.success('Logout realizado com sucesso');
  },

  // Selecionar componente
  selectComponent: (category: string, component: PriceItem, quantity = 1) => {
    const { selectedComponents } = get();
    
    const existingIndex = selectedComponents.findIndex(
      (sc) => sc.category === category && sc.component.id === component.id
    );

    if (existingIndex >= 0) {
      // Atualizar quantidade se já existe
      const updated = [...selectedComponents];
      updated[existingIndex].quantity += quantity;
      set({ selectedComponents: updated });
    } else {
      // Adicionar novo componente
      set({
        selectedComponents: [
          ...selectedComponents,
          { category, component, quantity }
        ]
      });
    }

    toast.success('Componente adicionado', {
      description: `${component.name} foi adicionado à sua configuração`
    });
  },

  // Remover componente
  removeComponent: (category: string, componentId: number) => {
    const { selectedComponents } = get();
    
    const updated = selectedComponents.filter(
      (sc) => !(sc.category === category && sc.component.id === componentId)
    );
    
    set({ selectedComponents: updated });
    
    toast.success('Componente removido', {
      description: 'O componente foi removido da sua configuração'
    });
  },

  // Atualizar quantidade do componente
  updateComponentQuantity: (category: string, componentId: number, quantity: number) => {
    const { selectedComponents } = get();
    
    if (quantity <= 0) {
      // Remover se quantidade for 0 ou negativa
      get().removeComponent(category, componentId);
      return;
    }
    
    const updated = selectedComponents.map((sc) => {
      if (sc.category === category && sc.component.id === componentId) {
        return { ...sc, quantity };
      }
      return sc;
    });
    
    set({ selectedComponents: updated });
  },

  // Limpar seleção
  clearSelection: () => {
    set({ selectedComponents: [] });
    toast.success('Configuração limpa', {
      description: 'Todos os componentes foram removidos'
    });
  },

  // Obter componentes por categoria
  getComponentsByCategory: (category: string) => {
    const { items } = get();
    return items.filter((item) => item.category === category);
  },

  // Calcular preço total
  getTotalPrice: () => {
    const { selectedComponents } = get();
    return selectedComponents.reduce(
      (total, sc) => total + (sc.component.price * sc.quantity),
      0
    );
  },

  // Contar componentes selecionados
  getSelectedComponentsCount: () => {
    const { selectedComponents } = get();
    return selectedComponents.reduce((total, sc) => total + sc.quantity, 0);
  },
}));

// Hook para verificar autenticação no carregamento inicial
export const initializeAuth = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    useAppStore.setState({
      isAuthenticated: true,
      token
    });
  }
};
