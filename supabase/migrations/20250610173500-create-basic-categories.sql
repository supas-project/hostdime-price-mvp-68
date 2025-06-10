
-- Criar categorias básicas para a tabela de preços

INSERT INTO public.component_categories (name, description, component_type, display_order, is_active) VALUES
('Processadores', 'Processadores e CPUs para servidores', 'cpu', 1, true),
('Memória RAM', 'Módulos de memória RAM para servidores', 'memory', 2, true),
('Sistema Operacional', 'Sistemas operacionais e licenças', 'os', 3, true),
('Conectividade', 'Opções de conectividade e largura de banda', 'connectivity', 4, true),
('Data Centers', 'Localização de data centers', 'datacenter', 5, true),
('Contratos', 'Tipos de contrato e durações', 'contract', 6, true)
ON CONFLICT (component_type) DO NOTHING;
