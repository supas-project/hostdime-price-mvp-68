
-- Criar tabela de categorias
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Criar tabela de itens
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  specs JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(category_id, name)
);

-- Criar tabela de log de alterações
CREATE TABLE public.change_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  version_number INTEGER NOT NULL DEFAULT 1
);

-- Criar tabela de versões para controle de rollback
CREATE TABLE public.data_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version_name TEXT NOT NULL,
  description TEXT,
  categories_snapshot JSONB NOT NULL,
  items_snapshot JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_current BOOLEAN NOT NULL DEFAULT false
);

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_versions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categories
CREATE POLICY "Users can view all categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update categories" ON public.categories FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete categories" ON public.categories FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas RLS para items
CREATE POLICY "Users can view all items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert items" ON public.items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update items" ON public.items FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete items" ON public.items FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas RLS para change_log
CREATE POLICY "Users can view change log" ON public.change_log FOR SELECT USING (true);
CREATE POLICY "System can insert change log" ON public.change_log FOR INSERT WITH CHECK (true);

-- Políticas RLS para data_versions
CREATE POLICY "Users can view data versions" ON public.data_versions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create versions" ON public.data_versions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamps
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para logging de mudanças
CREATE OR REPLACE FUNCTION log_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.change_log (table_name, record_id, operation, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.change_log (table_name, record_id, operation, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.change_log (table_name, record_id, operation, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers para logging
CREATE TRIGGER categories_change_log AFTER INSERT OR UPDATE OR DELETE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION log_data_changes();

CREATE TRIGGER items_change_log AFTER INSERT OR UPDATE OR DELETE ON public.items
    FOR EACH ROW EXECUTE FUNCTION log_data_changes();

-- Função para criar snapshot de versão
CREATE OR REPLACE FUNCTION create_data_snapshot(p_version_name TEXT, p_description TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    v_categories JSONB;
    v_items JSONB;
    v_version_id UUID;
BEGIN
    -- Capturar snapshot das categorias
    SELECT json_agg(row_to_json(c)) INTO v_categories
    FROM (SELECT * FROM public.categories ORDER BY display_order, name) c;
    
    -- Capturar snapshot dos itens
    SELECT json_agg(row_to_json(i)) INTO v_items
    FROM (SELECT * FROM public.items ORDER BY category_id, display_order, name) i;
    
    -- Marcar versão atual como não atual
    UPDATE public.data_versions SET is_current = false WHERE is_current = true;
    
    -- Inserir nova versão
    INSERT INTO public.data_versions (version_name, description, categories_snapshot, items_snapshot, created_by, is_current)
    VALUES (p_version_name, p_description, v_categories, v_items, auth.uid(), true)
    RETURNING id INTO v_version_id;
    
    RETURN v_version_id;
END;
$$ language 'plpgsql';

-- Índices para performance
CREATE INDEX idx_categories_active ON public.categories(active);
CREATE INDEX idx_categories_display_order ON public.categories(display_order);
CREATE INDEX idx_items_category_id ON public.items(category_id);
CREATE INDEX idx_items_active ON public.items(active);
CREATE INDEX idx_items_display_order ON public.items(display_order);
CREATE INDEX idx_change_log_table_record ON public.change_log(table_name, record_id);
CREATE INDEX idx_change_log_changed_at ON public.change_log(changed_at);

-- Habilitar realtime para sincronização
ALTER TABLE public.categories REPLICA IDENTITY FULL;
ALTER TABLE public.items REPLICA IDENTITY FULL;
ALTER TABLE public.change_log REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.change_log;
