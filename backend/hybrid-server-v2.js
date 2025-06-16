const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Tentar importar dependências opcionais
let helmet, rateLimit;
try {
  helmet = require('helmet');
  rateLimit = require('express-rate-limit');
} catch (err) {
  console.log('⚠️ Security packages not installed, using basic security');
}

// Importar serviços
const authService = require('./services/authService-v2');
const priceService = require('./services/priceService-v2');

// Configuração do banco de dados
let dbConnection;
let dbType = 'sqlite'; // padrão

async function initializeDatabase() {
  console.log('🔄 Inicializando conexão com banco de dados...');
  
  try {
    // Tentar PostgreSQL primeiro
    const { Pool } = require('pg');
    const pool = new Pool({
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      port: process.env.POSTGRES_PORT,
    });
    
    // Testar conexão
    await pool.query('SELECT 1');
    dbConnection = pool;
    dbType = 'postgresql';
    console.log('✅ PostgreSQL conectado');
    return { success: true, type: 'postgresql' };
  } catch (error) {
    console.log('⚠️ PostgreSQL não disponível, tentando SQLite:', error.message);
    
    try {
      const Database = require('sqlite3').Database;
      const path = require('path');
      const fs = require('fs');
      
      // Criar diretório se não existir
      const dbDir = path.join(__dirname, 'database');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      const dbPath = path.join(dbDir, 'app.db');
      
      dbConnection = new Database(dbPath);
      dbType = 'sqlite';
      console.log('✅ SQLite conectado');
      return { success: true, type: 'sqlite' };
    } catch (sqliteError) {
      console.error('❌ Erro ao conectar SQLite:', sqliteError.message);
      return { success: false, error: sqliteError.message };
    }
  }
}

// Criar aplicação Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://hostdime-price-mvp.vercel.app'] 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:8084'],
  credentials: true
}));

// Garantir que o body parser está ANTES de tudo
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Endpoint POST mínimo para debug
app.post('/api/debug/post', (req, res) => {
  console.log('🧪 POST mínimo recebido:', req.body);
  res.json({ success: true, received: req.body });
});

// Segurança básica
if (helmet) {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
}

// Rate limiting se disponível
if (rateLimit) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
      success: false,
      error: 'Muitas tentativas. Tente novamente em 15 minutos.'
    }
  });
  app.use(limiter);
}

// Middleware de logging
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ROTAS
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: dbType === 'postgresql' ? 'PostgreSQL' : 'SQLite',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Autenticação
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 [LOGIN] Endpoint chamado');
    const { email, password } = req.body;
    console.log('🔐 [LOGIN] Email recebido:', email);
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }
    const result = await authService.login(email, password);
    if (result.success) {
      console.log('✅ [LOGIN] Login bem-sucedido');
      res.json(result);
    } else {
      console.log('❌ [LOGIN] Login falhou');
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('❌ [LOGIN] Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Verificar token
app.get('/api/auth/verify', authService.authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

// Categorias
app.get('/api/categories', async (req, res) => {
  try {
    console.log('📂 Buscando categorias');
    const categories = await priceService.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar categorias'
    });
  }
});

// Items por categoria
app.get('/api/categories/:categoryId/items', async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`📦 Buscando items da categoria ${categoryId}`);
    
    const items = await priceService.getItemsByCategory(categoryId);
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('❌ Erro ao buscar items:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar items'
    });
  }
});

// Adicionar categoria (admin)
app.post('/api/categories', authService.authenticateToken, authService.requireAdmin, async (req, res) => {
  try {
    const { name, slug } = req.body;
    console.log('➕ Adicionando categoria:', name);
    
    const result = await priceService.addCategory({ name, slug });
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao adicionar categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar categoria'
    });
  }
});

// Adicionar item (admin)
app.post('/api/items', authService.authenticateToken, authService.requireAdmin, async (req, res) => {
  try {
    const itemData = req.body;
    console.log('➕ Adicionando item:', itemData.name);
    
    const result = await priceService.addItem(itemData);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao adicionar item:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar item'
    });
  }
});

// Atualizar preços (admin)
app.put('/api/items/:itemId', authService.authenticateToken, authService.requireAdmin, async (req, res) => {
  try {
    const { itemId } = req.params;
    const updateData = req.body;
    console.log('🔄 Atualizando item:', itemId);
    
    const result = await priceService.updateItem(itemId, updateData);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao atualizar item:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar item'
    });
  }
});

// Teste simples de login (para debug)
app.post('/api/test/login', async (req, res) => {
  try {
    console.log('🧪 Teste de login simples');
    const { email, password } = req.body;
    
    console.log('📧 Email recebido:', email);
    console.log('🔑 Password recebido:', password ? '[HIDDEN]' : 'undefined');
    
    // Teste básico sem authService
    if (email === 'admin@hostdime.com' && password === 'admin123') {
      res.json({
        success: true,
        message: 'Login de teste bem-sucedido',
        user: { email, name: 'Admin Test' }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Credenciais de teste inválidas'
      });
    }
  } catch (error) {
    console.error('❌ Erro no teste de login:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Middleware de tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    path: req.path,
    method: req.method
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Iniciar servidor
async function startServer() {
  console.log('🚀 Iniciando HostDime Price MVP - Servidor Híbrido');
  console.log('🌍 Ambiente:', process.env.NODE_ENV || 'development');
  
  // Inicializar banco de dados
  const dbResult = await initializeDatabase();
  if (!dbResult.success) {
    console.error('❌ Falha ao conectar com banco de dados');
    process.exit(1);
  }
  
  // Passar conexão para os serviços
  authService.setConnection(dbConnection, dbType);
  priceService.setConnection(dbConnection, dbType);
  
  // Inicializar dados básicos se necessário
  try {
    if (dbType === 'sqlite') {
      console.log('🔄 Inicializando dados SQLite...');
      // Aqui poderia executar scripts de inicialização para SQLite
    }
  } catch (initError) {
    console.log('⚠️ Aviso na inicialização:', initError.message);
  }
  
  // Iniciar servidor
  const server = app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
    console.log(`📂 Categories: http://localhost:${PORT}/api/categories`);
    console.log(`💾 Banco: ${dbType.toUpperCase()}`);
    console.log('🎯 Servidor pronto para receber requisições!');
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('📦 Recebido SIGTERM, encerrando graciosamente...');
    server.close(async () => {
      if (dbType === 'postgresql' && dbConnection) {
        await dbConnection.end();
      } else if (dbType === 'sqlite' && dbConnection) {
        dbConnection.close();
      }
      console.log('✅ Servidor encerrado');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', async () => {
    console.log('📦 Recebido SIGINT, encerrando graciosamente...');
    server.close(async () => {
      if (dbType === 'postgresql' && dbConnection) {
        await dbConnection.end();
      } else if (dbType === 'sqlite' && dbConnection) {
        dbConnection.close();
      }
      console.log('✅ Servidor encerrado');
      process.exit(0);
    });
  });
}

// Iniciar servidor
startServer().catch(error => {
  console.error('❌ Erro fatal ao iniciar servidor:', error);
  process.exit(1);
});
