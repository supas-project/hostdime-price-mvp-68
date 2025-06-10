
-- Ajustar políticas RLS para permitir acesso adequado às tabelas de pricing

-- Remover políticas existentes que estão causando problemas
DROP POLICY IF EXISTS "Anyone can read component categories" ON public.component_categories;
DROP POLICY IF EXISTS "Admins can manage component categories" ON public.component_categories;
DROP POLICY IF EXISTS "Anyone can read component items" ON public.component_items;
DROP POLICY IF EXISTS "Admins can manage component items" ON public.component_items;
DROP POLICY IF EXISTS "Anyone can read price modifiers" ON public.price_modifiers;
DROP POLICY IF EXISTS "Admins can manage price modifiers" ON public.price_modifiers;

-- Criar políticas corretas para categorias
CREATE POLICY "Authenticated users can read component categories" ON public.component_categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage component categories" ON public.component_categories
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'tipo' = 'admin'
    )
  );

-- Criar políticas corretas para itens
CREATE POLICY "Authenticated users can read component items" ON public.component_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage component items" ON public.component_items
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'tipo' = 'admin'
    )
  );

-- Criar políticas corretas para modificadores de preço
CREATE POLICY "Authenticated users can read price modifiers" ON public.price_modifiers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage price modifiers" ON public.price_modifiers
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'tipo' = 'admin'
    )
  );
