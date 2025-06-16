
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export interface QuoteTemplate {
  id: string;
  name: string;
  description?: string;
  company_logo?: string;
  header_text?: string;
  footer_text?: string;
  terms_conditions?: string;
  validity_days: number;
  show_payback: boolean;
  show_breakdown: boolean;
  created_at: string;
  updated_at: string;
}

export function useQuoteTemplates() {
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<QuoteTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quote_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
      
      // Se não há template selecionado, seleciona o primeiro
      if (!currentTemplate && data && data.length > 0) {
        setCurrentTemplate(data[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      toast.error("Erro ao carregar templates de cotação");
    } finally {
      setLoading(false);
    }
  }, [currentTemplate]);

  const getTemplateById = useCallback(async (templateId: string): Promise<QuoteTemplate | null> => {
    try {
      const { data, error } = await supabase
        .from('quote_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Erro ao buscar template:", error);
      return null;
    }
  }, []);

  const getDefaultTemplate = useCallback((): QuoteTemplate | null => {
    return templates.length > 0 ? templates[0] : null;
  }, [templates]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    currentTemplate,
    loading,
    loadTemplates,
    getTemplateById,
    getDefaultTemplate,
    setCurrentTemplate
  };
}
