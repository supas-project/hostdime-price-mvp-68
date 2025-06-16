
import { useState, useCallback } from 'react';
import { Quote, QuoteStatus, ServerConfiguration, QuoteItem } from '@/types/quote';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

export function useQuoteManagement() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const { user } = useAuth();

  const createQuote = useCallback(async (configuration: ServerConfiguration): Promise<Quote | null> => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return null;
    }

    setLoading(true);
    try {
      // Calcular preço total
      const totalPrice = calculateTotalPrice(configuration);
      
      const newQuote: Omit<Quote, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        status: QuoteStatus.DRAFT,
        configuration,
        total_price: totalPrice,
        subtotal: totalPrice,
        discounts: 0,
        taxes: 0,
        contract_duration: 12,
        data_center_id: configuration.data_center?.id || '',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { data, error } = await supabase
        .from('quotes')
        .insert([newQuote])
        .select()
        .single();

      if (error) throw error;

      const quote = data as Quote;
      
      // Criar itens da cotação
      await createQuoteItems(quote.id, configuration);
      
      setQuotes(prev => [quote, ...prev]);
      setCurrentQuote(quote);
      
      toast.success("Cotação criada com sucesso");
      return quote;

    } catch (error) {
      console.error("Erro ao criar cotação:", error);
      toast.error("Erro ao criar cotação");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createQuoteItems = async (quoteId: string, configuration: ServerConfiguration) => {
    const items: Omit<QuoteItem, 'id' | 'created_at'>[] = [];

    // CPU
    if (configuration.cpu) {
      items.push({
        quote_id: quoteId,
        item_id: configuration.cpu.id,
        item_type: 'cpu',
        name: configuration.cpu.name,
        description: configuration.cpu.description,
        quantity: 1,
        unit_price: configuration.cpu.price,
        total_price: configuration.cpu.price,
        payback_applied: configuration.cpu.isHardware || false,
        payback_factor: configuration.cpu.isHardware ? 6 : undefined
      });
    }

    // Memória
    if (configuration.memory) {
      items.push({
        quote_id: quoteId,
        item_id: configuration.memory.id,
        item_type: 'memory',
        name: configuration.memory.name,
        description: configuration.memory.description,
        quantity: 1,
        unit_price: configuration.memory.price,
        total_price: configuration.memory.price,
        payback_applied: configuration.memory.isHardware || false,
        payback_factor: configuration.memory.isHardware ? 6 : undefined
      });
    }

    // Storage interno
    configuration.storage_internal?.forEach(storage => {
      items.push({
        quote_id: quoteId,
        item_id: storage.id,
        item_type: 'storage_internal',
        name: storage.name,
        description: storage.description,
        quantity: 1,
        unit_price: storage.price,
        total_price: storage.price,
        payback_applied: storage.isHardware || false,
        payback_factor: storage.isHardware ? 6 : undefined
      });
    });

    // Storage externo
    configuration.storage_external?.forEach(storage => {
      items.push({
        quote_id: quoteId,
        item_id: storage.id,
        item_type: 'storage_external',
        name: storage.name,
        description: storage.description,
        quantity: 1,
        unit_price: storage.price,
        total_price: storage.price,
        payback_applied: false
      });
    });

    // Conectividade
    Object.entries(configuration.connectivity || {}).forEach(([key, connectivityItem]) => {
      items.push({
        quote_id: quoteId,
        item_id: connectivityItem.option.id,
        item_type: 'connectivity',
        name: connectivityItem.option.name,
        description: connectivityItem.option.description,
        quantity: connectivityItem.quantity,
        unit_price: connectivityItem.option.price,
        total_price: connectivityItem.option.price * connectivityItem.quantity,
        payback_applied: false
      });
    });

    // Sistema operacional
    if (configuration.operating_system) {
      items.push({
        quote_id: quoteId,
        item_id: configuration.operating_system.id,
        item_type: 'operating_system',
        name: configuration.operating_system.name,
        description: configuration.operating_system.description,
        quantity: 1,
        unit_price: configuration.operating_system.price,
        total_price: configuration.operating_system.price,
        payback_applied: false
      });
    }

    // Serviços customizados
    configuration.custom_services?.forEach(service => {
      items.push({
        quote_id: quoteId,
        item_id: service.id,
        item_type: 'custom_service',
        name: service.name,
        description: service.description,
        quantity: 1,
        unit_price: service.price,
        total_price: service.price,
        payback_applied: false
      });
    });

    if (items.length > 0) {
      const { error } = await supabase
        .from('quote_items')
        .insert(items);

      if (error) {
        console.error("Erro ao criar itens da cotação:", error);
        throw error;
      }
    }
  };

  const updateQuote = useCallback(async (quoteId: string, updates: Partial<Quote>): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', quoteId);

      if (error) throw error;

      setQuotes(prev => prev.map(quote => 
        quote.id === quoteId ? { ...quote, ...updates } : quote
      ));

      if (currentQuote?.id === quoteId) {
        setCurrentQuote(prev => prev ? { ...prev, ...updates } : null);
      }

      toast.success("Cotação atualizada com sucesso");
      return true;

    } catch (error) {
      console.error("Erro ao atualizar cotação:", error);
      toast.error("Erro ao atualizar cotação");
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentQuote]);

  const deleteQuote = useCallback(async (quoteId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId);

      if (error) throw error;

      setQuotes(prev => prev.filter(quote => quote.id !== quoteId));
      
      if (currentQuote?.id === quoteId) {
        setCurrentQuote(null);
      }

      toast.success("Cotação excluída com sucesso");
      return true;

    } catch (error) {
      console.error("Erro ao excluir cotação:", error);
      toast.error("Erro ao excluir cotação");
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentQuote]);

  const loadQuotes = useCallback(async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuotes(data as Quote[]);

    } catch (error) {
      console.error("Erro ao carregar cotações:", error);
      toast.error("Erro ao carregar cotações");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const duplicateQuote = useCallback(async (quoteId: string): Promise<Quote | null> => {
    const originalQuote = quotes.find(q => q.id === quoteId);
    if (!originalQuote) {
      toast.error("Cotação não encontrada");
      return null;
    }

    return createQuote(originalQuote.configuration);
  }, [quotes, createQuote]);

  const changeQuoteStatus = useCallback(async (quoteId: string, status: QuoteStatus): Promise<boolean> => {
    const updates: Partial<Quote> = { status };

    if (status === QuoteStatus.SENT) {
      updates.sent_at = new Date().toISOString();
    } else if (status === QuoteStatus.APPROVED) {
      updates.approved_at = new Date().toISOString();
    }

    return updateQuote(quoteId, updates);
  }, [updateQuote]);

  const getQuoteById = useCallback(async (quoteId: string): Promise<Quote | null> => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_items (*)
        `)
        .eq('id', quoteId)
        .single();

      if (error) throw error;

      return data as Quote;
    } catch (error) {
      console.error("Erro ao buscar cotação:", error);
      return null;
    }
  }, []);

  return {
    quotes,
    currentQuote,
    loading,
    createQuote,
    updateQuote,
    deleteQuote,
    loadQuotes,
    duplicateQuote,
    changeQuoteStatus,
    getQuoteById,
    setCurrentQuote
  };
}

// Função auxiliar para calcular preço total
function calculateTotalPrice(configuration: ServerConfiguration): number {
  let total = 0;

  // Somar todos os componentes
  if (configuration.cpu) total += configuration.cpu.price;
  if (configuration.memory) total += configuration.memory.price;
  if (configuration.operating_system) total += configuration.operating_system.price;

  // Storage interno
  configuration.storage_internal?.forEach(storage => {
    total += storage.price;
  });

  // Storage externo
  configuration.storage_external?.forEach(storage => {
    total += storage.price;
  });

  // Conectividade
  Object.values(configuration.connectivity || {}).forEach(item => {
    total += item.option.price * item.quantity;
  });

  // Serviços customizados
  configuration.custom_services?.forEach(service => {
    total += service.price;
  });

  return total;
}
