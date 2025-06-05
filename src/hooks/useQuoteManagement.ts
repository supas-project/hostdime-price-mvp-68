
import { useState, useCallback } from 'react';
import { Quote, QuoteStatus, ServerConfiguration } from '@/types/quote';
import { useAuth } from '@/contexts/AuthContext';
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
      // Calcular preço total (implementar lógica de cálculo)
      const totalPrice = calculateTotalPrice(configuration);
      
      const newQuote: Omit<Quote, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        status: QuoteStatus.DRAFT,
        configuration,
        total_price: totalPrice,
        subtotal: totalPrice,
        discounts: 0,
        taxes: 0,
        contract_duration: 12, // padrão
        data_center_id: configuration.data_center?.id || '',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      };

      // Salvar no Supabase (implementar tabela de quotes)
      const { data, error } = await supabase
        .from('quotes')
        .insert([newQuote])
        .select()
        .single();

      if (error) throw error;

      const quote = data as Quote;
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
        .select('*')
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
