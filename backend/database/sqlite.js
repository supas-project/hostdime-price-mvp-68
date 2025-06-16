const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class SQLiteConnection {
  constructor() {
    const dbDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    this.dbPath = path.join(dbDir, 'hostdime_price.db');
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ SQLite connection error:', err);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        this.db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({ rows });
          }
        });
      } else {
        this.db.run(sql, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ 
              rows: [],
              rowCount: this.changes,
              lastID: this.lastID
            });
          }
        });
      }
    });
  }

  async initializeDatabase() {
    const initSQL = `
      -- Tabela de usuários
      CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          is_admin INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME,
          is_active INTEGER DEFAULT 1
      );

      -- Tabela de categorias
      CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          description TEXT,
          sort_order INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de itens de preços
      CREATE TABLE IF NOT EXISTS price_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL DEFAULT 0.00,
          specifications TEXT, -- JSON como string
          sort_order INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Inserir categorias padrão
      INSERT OR IGNORE INTO categories (name, display_name, description, sort_order) VALUES
      ('cpu', 'CPU', 'Processadores para servidores', 1),
      ('memoria', 'Memória', 'Memória RAM DDR4/DDR5', 2),
      ('armazenamento', 'Armazenamento', 'SSDs e HDDs para servidores', 3),
      ('rede', 'Rede', 'Conexões de rede e largura de banda', 4),
      ('backup', 'Backup', 'Soluções de backup e redundância', 5),
      ('sistema-operacional', 'Sistema Operacional', 'Sistemas operacionais licenciados', 6);

      -- Inserir itens de preço padrão
      INSERT OR IGNORE INTO price_items (category_id, name, description, price, specifications, sort_order) VALUES
      -- CPU
      (1, 'Intel Xeon E5-2620v3', 'Processador 6 cores, 12 threads', 450.00, '["6 Cores", "12 Threads", "2.4 GHz"]', 1),
      (1, 'Intel Xeon E5-2680v4', 'Processador 14 cores, 28 threads', 650.00, '["14 Cores", "28 Threads", "2.4 GHz"]', 2),
      (1, 'AMD EPYC 7302P', 'Processador 16 cores, 32 threads', 800.00, '["16 Cores", "32 Threads", "3.0 GHz"]', 3),

      -- Memória
      (2, '32GB RAM DDR4', 'Memória RAM DDR4 ECC', 240.00, '["32GB", "DDR4", "ECC"]', 1),
      (2, '64GB RAM DDR4', 'Memória RAM DDR4 ECC', 480.00, '["64GB", "DDR4", "ECC"]', 2),
      (2, '128GB RAM DDR4', 'Memória RAM DDR4 ECC', 960.00, '["128GB", "DDR4", "ECC"]', 3),

      -- Armazenamento
      (3, 'SSD 512GB NVMe', 'SSD NVMe para alta performance', 150.00, '["512GB", "NVMe", "3500 MB/s"]', 1),
      (3, 'SSD 1TB NVMe', 'SSD NVMe para alta performance', 300.00, '["1TB", "NVMe", "3500 MB/s"]', 2),
      (3, 'SSD 2TB NVMe', 'SSD NVMe para alta performance', 600.00, '["2TB", "NVMe", "3500 MB/s"]', 3),
      (3, 'HDD 4TB SATA', 'Hard disk tradicional', 200.00, '["4TB", "SATA", "7200 RPM"]', 4),

      -- Rede
      (4, 'Porta 1Gbps', 'Conexão de rede 1Gbps', 50.00, '["1Gbps", "Ethernet", "Unlimited"]', 1),
      (4, 'Porta 10Gbps', 'Conexão de rede 10Gbps', 200.00, '["10Gbps", "Ethernet", "Unlimited"]', 2),

      -- Backup
      (5, 'Backup 500GB', 'Backup automático diário', 100.00, '["500GB", "Diário", "Automático"]', 1),
      (5, 'Backup 1TB', 'Backup automático diário', 180.00, '["1TB", "Diário", "Automático"]', 2),

      -- Sistema Operacional
      (6, 'Ubuntu Server 22.04', 'Sistema operacional Linux gratuito', 0.00, '["Linux", "LTS", "Gratuito"]', 1),
      (6, 'Windows Server 2022', 'Sistema operacional Windows', 150.00, '["Windows", "Licenciado", "Suporte"]', 2),
      (6, 'CentOS 9', 'Sistema operacional Linux gratuito', 0.00, '["Linux", "Enterprise", "Gratuito"]', 3);
    `;

    const statements = initSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await this.query(statement.trim());
      }
    }
    
    console.log('✅ SQLite database initialized');
  }

  async testConnection() {
    try {
      const result = await this.query('SELECT datetime("now") as current_time');
      console.log('✅ SQLite connection test successful:', result.rows[0].current_time);
      return true;
    } catch (error) {
      console.error('❌ SQLite connection test failed:', error);
      return false;
    }
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('❌ Error closing SQLite database:', err);
          } else {
            console.log('✅ SQLite database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = SQLiteConnection;
