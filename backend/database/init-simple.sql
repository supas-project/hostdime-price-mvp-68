-- Script de inicialização do banco de dados HostDime Price MVP (sem UUID)
-- Execute este script no PostgreSQL para criar as tabelas necessárias

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Tabela de categorias de componentes
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens de preço
CREATE TABLE IF NOT EXISTS price_items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    specifications JSONB DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_price_items_category ON price_items(category_id);
CREATE INDEX IF NOT EXISTS idx_price_items_active ON price_items(is_active);

-- Inserir categorias iniciais
INSERT INTO categories (name, slug, display_name, description, sort_order) VALUES
('cpu', 'cpu', 'Processador', 'Processadores Intel e AMD', 1),
('memory', 'memory', 'Memória RAM', 'Módulos de memória DDR4 e DDR5', 2),
('storage', 'storage', 'Armazenamento', 'HDDs, SSDs e NVMe', 3),
('motherboard', 'motherboard', 'Placa-Mãe', 'Placas-mãe para diferentes sockets', 4),
('gpu', 'gpu', 'Placa de Vídeo', 'Placas de vídeo dedicadas', 5),
('psu', 'psu', 'Fonte de Alimentação', 'Fontes ATX e modulares', 6),
('case', 'case', 'Gabinete', 'Gabinetes ATX e micro-ATX', 7),
('cooling', 'cooling', 'Refrigeração', 'Coolers e sistemas de refrigeração', 8)
ON CONFLICT (slug) DO NOTHING;

-- Inserir itens de exemplo para cada categoria
INSERT INTO price_items (category_id, name, description, price, specifications) VALUES
-- Processadores
(1, 'Intel Core i5-13400F', 'Processador Intel Core i5 13ª geração', 899.99, '[{"cores": 10, "threads": 16, "base_clock": "2.5GHz", "boost_clock": "4.6GHz"}]'),
(1, 'AMD Ryzen 5 7600X', 'Processador AMD Ryzen 5 série 7000', 1299.99, '[{"cores": 6, "threads": 12, "base_clock": "4.7GHz", "boost_clock": "5.3GHz"}]'),
(1, 'Intel Core i7-13700K', 'Processador Intel Core i7 13ª geração', 1899.99, '[{"cores": 16, "threads": 24, "base_clock": "3.4GHz", "boost_clock": "5.4GHz"}]'),

-- Memória RAM
(2, 'Corsair Vengeance LPX 16GB DDR4', 'Kit 2x8GB DDR4-3200', 299.99, '[{"capacity": "16GB", "type": "DDR4", "speed": "3200MHz", "latency": "CL16"}]'),
(2, 'G.Skill Trident Z5 32GB DDR5', 'Kit 2x16GB DDR5-5600', 899.99, '[{"capacity": "32GB", "type": "DDR5", "speed": "5600MHz", "latency": "CL36"}]'),
(2, 'Kingston Fury Beast 8GB DDR4', 'Módulo único 8GB DDR4-3200', 149.99, '[{"capacity": "8GB", "type": "DDR4", "speed": "3200MHz", "latency": "CL16"}]'),

-- Armazenamento
(3, 'Samsung 980 NVMe SSD 1TB', 'SSD NVMe M.2 PCIe 3.0', 449.99, '[{"capacity": "1TB", "type": "NVMe", "interface": "M.2", "read_speed": "3500MB/s"}]'),
(3, 'Western Digital Blue 2TB HDD', 'HD SATA 7200RPM', 299.99, '[{"capacity": "2TB", "type": "HDD", "interface": "SATA", "rpm": "7200"}]'),
(3, 'Crucial MX4 500GB SSD', 'SSD SATA 2.5"', 249.99, '[{"capacity": "500GB", "type": "SSD", "interface": "SATA", "read_speed": "560MB/s"}]'),

-- Placas-Mãe
(4, 'ASUS ROG Strix B550-F', 'Placa-mãe AMD AM4 ATX', 699.99, '[{"socket": "AM4", "chipset": "B550", "form_factor": "ATX", "ram_slots": 4}]'),
(4, 'MSI MAG B660M Mortar', 'Placa-mãe Intel LGA1700 mATX', 599.99, '[{"socket": "LGA1700", "chipset": "B660", "form_factor": "mATX", "ram_slots": 4}]'),

-- Placas de Vídeo
(5, 'NVIDIA RTX 4060 Ti', 'Placa de vídeo RTX 4060 Ti 16GB', 2499.99, '[{"memory": "16GB", "memory_type": "GDDR6", "boost_clock": "2535MHz", "power": "165W"}]'),
(5, 'AMD RX 7600 XT', 'Placa de vídeo RX 7600 XT 16GB', 2199.99, '[{"memory": "16GB", "memory_type": "GDDR6", "boost_clock": "2755MHz", "power": "190W"}]'),

-- Fontes
(6, 'Corsair CV650 650W', 'Fonte 650W 80+ Bronze', 349.99, '[{"power": "650W", "efficiency": "80+ Bronze", "modular": false, "pfc": "Active"}]'),
(6, 'SeaSonic Focus GX-750 750W', 'Fonte 750W 80+ Gold Modular', 599.99, '[{"power": "750W", "efficiency": "80+ Gold", "modular": true, "pfc": "Active"}]'),

-- Gabinetes
(7, 'Fractal Design Core 1000', 'Gabinete micro-ATX', 199.99, '[{"form_factor": "mATX", "material": "Steel", "usb_ports": 2, "fans_included": 1}]'),
(7, 'NZXT H510 Elite', 'Gabinete ATX com vidro temperado', 599.99, '[{"form_factor": "ATX", "material": "Steel/Glass", "usb_ports": 4, "fans_included": 2}]'),

-- Refrigeração
(8, 'Cooler Master Hyper 212', 'Cooler de CPU universal', 149.99, '[{"type": "Air", "height": "158mm", "compatibility": "Intel/AMD", "fans": 1}]'),
(8, 'Corsair H100i RGB Platinum', 'Water cooler AIO 240mm', 699.99, '[{"type": "Liquid", "radiator": "240mm", "compatibility": "Intel/AMD", "fans": 2}]')
ON CONFLICT DO NOTHING;

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamp
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_items_updated_at BEFORE UPDATE ON price_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
