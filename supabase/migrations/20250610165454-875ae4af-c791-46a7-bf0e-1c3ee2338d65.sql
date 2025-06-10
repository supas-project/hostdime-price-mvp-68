
-- Criar tabela de categorias de componentes
CREATE TABLE IF NOT EXISTS public.component_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  component_type TEXT NOT NULL, -- cpu, memory, storage, os, connectivity, datacenter, contract
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Criar tabela de itens/componentes
CREATE TABLE IF NOT EXISTS public.component_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.component_categories(id) ON DELETE CASCADE,
  component_id TEXT NOT NULL, -- ID único do componente (ex: cpu-intel-i7-12700k)
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0, -- preço base sem modificadores
  subtype TEXT, -- standard, premium, ultra, etc
  is_hardware BOOLEAN NOT NULL DEFAULT false,
  specs JSONB DEFAULT '[]'::jsonb, -- especificações técnicas
  metadata JSONB DEFAULT '{}'::jsonb, -- dados específicos do tipo
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT unique_component_id UNIQUE(component_id),
  CONSTRAINT positive_price CHECK (price >= 0),
  CONSTRAINT positive_base_price CHECK (base_price >= 0)
);

-- Criar tabela para modificadores de preço
CREATE TABLE IF NOT EXISTS public.price_modifiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  modifier_type TEXT NOT NULL, -- percentage, fixed, multiplier
  value DECIMAL(10,4) NOT NULL,
  conditions JSONB DEFAULT '{}'::jsonb, -- condições para aplicar o modificador
  applies_to TEXT[], -- tipos de componentes que podem usar este modificador
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_component_categories_type ON public.component_categories(component_type);
CREATE INDEX IF NOT EXISTS idx_component_categories_active ON public.component_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_component_items_category ON public.component_items(category_id);
CREATE INDEX IF NOT EXISTS idx_component_items_component_id ON public.component_items(component_id);
CREATE INDEX IF NOT EXISTS idx_component_items_active ON public.component_items(is_active);
CREATE INDEX IF NOT EXISTS idx_component_items_subtype ON public.component_items(subtype);
CREATE INDEX IF NOT EXISTS idx_price_modifiers_type ON public.price_modifiers(modifier_type);
CREATE INDEX IF NOT EXISTS idx_price_modifiers_active ON public.price_modifiers(is_active);

-- Habilitar RLS
ALTER TABLE public.component_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_modifiers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias (leitura para todos autenticados, escrita para admins)
CREATE POLICY "Anyone can read component categories" ON public.component_categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage component categories" ON public.component_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- Políticas RLS para itens (leitura para todos autenticados, escrita para admins)
CREATE POLICY "Anyone can read component items" ON public.component_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage component items" ON public.component_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- Políticas RLS para modificadores (leitura para todos autenticados, escrita para admins)
CREATE POLICY "Anyone can read price modifiers" ON public.price_modifiers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage price modifiers" ON public.price_modifiers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- Criar triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_component_categories_updated_at 
  BEFORE UPDATE ON public.component_categories 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_component_items_updated_at 
  BEFORE UPDATE ON public.component_items 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_price_modifiers_updated_at 
  BEFORE UPDATE ON public.price_modifiers 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir categorias baseadas nos componentes existentes
INSERT INTO public.component_categories (name, description, component_type, display_order) VALUES
('Processadores', 'CPUs e processadores do servidor', 'cpu', 1),
('Memória', 'Módulos de memória RAM', 'memory', 2),
('Armazenamento', 'Discos e storage interno/externo', 'storage', 3),
('Sistema Operacional', 'Sistemas operacionais e licenças', 'os', 4),
('Conectividade', 'Portas de rede e IPs', 'connectivity', 5),
('Data Center', 'Localização e infraestrutura', 'datacenter', 6),
('Contratos', 'Tipos de contrato e condições', 'contract', 7);
