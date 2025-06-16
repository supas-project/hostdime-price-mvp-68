-- Script de inicialização do banco de dados HostDime Price MVP
-- Execute este script no PostgreSQL para criar as tabelas necessárias

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabela de categorias de componentes
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens de preços
CREATE TABLE IF NOT EXISTS price_items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    specifications JSONB,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sessões (para controle de JWT)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_price_items_category ON price_items(category_id);
CREATE INDEX IF NOT EXISTS idx_price_items_active ON price_items(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_price_items_updated_at ON price_items;
CREATE TRIGGER update_price_items_updated_at 
    BEFORE UPDATE ON price_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO categories (name, display_name, description, sort_order) VALUES
('cpu', 'CPU', 'Processadores para servidores', 1),
('memoria', 'Memória', 'Memória RAM DDR4/DDR5', 2),
('armazenamento', 'Armazenamento', 'SSDs e HDDs para servidores', 3),
('rede', 'Rede', 'Conexões de rede e largura de banda', 4),
('backup', 'Backup', 'Soluções de backup e redundância', 5),
('sistema-operacional', 'Sistema Operacional', 'Sistemas operacionais licenciados', 6)
ON CONFLICT (name) DO NOTHING;

-- Inserir itens de preço padrão
INSERT INTO price_items (category_id, name, description, price, specifications, sort_order) VALUES
-- CPU
((SELECT id FROM categories WHERE name = 'cpu'), 'Intel Xeon E5-2620v3', 'Processador 6 cores, 12 threads', 450.00, '["6 Cores", "12 Threads", "2.4 GHz"]', 1),
((SELECT id FROM categories WHERE name = 'cpu'), 'Intel Xeon E5-2680v4', 'Processador 14 cores, 28 threads', 650.00, '["14 Cores", "28 Threads", "2.4 GHz"]', 2),
((SELECT id FROM categories WHERE name = 'cpu'), 'AMD EPYC 7302P', 'Processador 16 cores, 32 threads', 800.00, '["16 Cores", "32 Threads", "3.0 GHz"]', 3),

-- Memória
((SELECT id FROM categories WHERE name = 'memoria'), '32GB RAM DDR4', 'Memória RAM DDR4 ECC', 240.00, '["32GB", "DDR4", "ECC"]', 1),
((SELECT id FROM categories WHERE name = 'memoria'), '64GB RAM DDR4', 'Memória RAM DDR4 ECC', 480.00, '["64GB", "DDR4", "ECC"]', 2),
((SELECT id FROM categories WHERE name = 'memoria'), '128GB RAM DDR4', 'Memória RAM DDR4 ECC', 960.00, '["128GB", "DDR4", "ECC"]', 3),

-- Armazenamento
((SELECT id FROM categories WHERE name = 'armazenamento'), 'SSD 512GB NVMe', 'SSD NVMe para alta performance', 150.00, '["512GB", "NVMe", "3500 MB/s"]', 1),
((SELECT id FROM categories WHERE name = 'armazenamento'), 'SSD 1TB NVMe', 'SSD NVMe para alta performance', 300.00, '["1TB", "NVMe", "3500 MB/s"]', 2),
((SELECT id FROM categories WHERE name = 'armazenamento'), 'SSD 2TB NVMe', 'SSD NVMe para alta performance', 600.00, '["2TB", "NVMe", "3500 MB/s"]', 3),
((SELECT id FROM categories WHERE name = 'armazenamento'), 'HDD 4TB SATA', 'Hard disk tradicional', 200.00, '["4TB", "SATA", "7200 RPM"]', 4),

-- Rede
((SELECT id FROM categories WHERE name = 'rede'), 'Porta 1Gbps', 'Conexão de rede 1Gbps', 50.00, '["1Gbps", "Ethernet", "Unlimited"]', 1),
((SELECT id FROM categories WHERE name = 'rede'), 'Porta 10Gbps', 'Conexão de rede 10Gbps', 200.00, '["10Gbps", "Ethernet", "Unlimited"]', 2),

-- Backup
((SELECT id FROM categories WHERE name = 'backup'), 'Backup 500GB', 'Backup automático diário', 100.00, '["500GB", "Diário", "Automático"]', 1),
((SELECT id FROM categories WHERE name = 'backup'), 'Backup 1TB', 'Backup automático diário', 180.00, '["1TB", "Diário", "Automático"]', 2),

-- Sistema Operacional
((SELECT id FROM categories WHERE name = 'sistema-operacional'), 'Ubuntu Server 22.04', 'Sistema operacional Linux gratuito', 0.00, '["Linux", "LTS", "Gratuito"]', 1),
((SELECT id FROM categories WHERE name = 'sistema-operacional'), 'Windows Server 2022', 'Sistema operacional Windows', 150.00, '["Windows", "Licenciado", "Suporte"]', 2),
((SELECT id FROM categories WHERE name = 'sistema-operacional'), 'CentOS 9', 'Sistema operacional Linux gratuito', 0.00, '["Linux", "Enterprise", "Gratuito"]', 3)
ON CONFLICT DO NOTHING;

-- Inserir usuário administrador padrão (será substituído)
-- Senha: H0stD1m3@2025 (hash será gerado pelo backend)
-- Este usuário será criado pelo backend na primeira execução
